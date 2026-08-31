"use client";
import { useState } from 'react';
import { Wand2, Dice5, User, Shield, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState('creation'); // 'creation' veya 'game'
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [customClassMode, setCustomClassMode] = useState(false);

  // Karakter Durumu (State)
  const [character, setCharacter] = useState({
    name: '',
    race: 'İnsan',
    className: 'Savaşçı',
    customClassDetails: '',
    backstory: '',
    appearance: '',
    avatarUrl: '',
    stats: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    }
  });

  const presetRaces = ['İnsan', 'Elf', 'Cüce', 'Ork', 'Buçukluk', 'Ejderdoğan'];
  const presetClasses = ['Savaşçı', 'Büyücü', 'Ranger (Avcı)', 'Rogue (Hırsız)', 'Ruhban', 'Özel Sınıf Oluştur...'];

  // Sınıf Değişimi
  const handleClassChange = (e) => {
    const val = e.target.value;
    if (val === 'Özel Sınıf Oluştur...') {
      setCustomClassMode(true);
      setCharacter({ ...character, className: '' });
    } else {
      setCustomClassMode(false);
      setCharacter({ ...character, className: val });
    }
  };

  // AI ile Rastgele Karakter Oluşturma
  const generateRandomCharacter = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/character/generate', { method: 'POST' });
      const data = await res.json();
      if (data.character) {
        setCharacter(data.character);
        if (!presetClasses.includes(data.character.className)) {
          setCustomClassMode(true);
        } else {
          setCustomClassMode(false);
        }
      }
    } catch (err) {
      alert("AI Karakter oluştururken bir hata oluştu.");
    } finally {
      setLoadingAi(false);
    }
  };

  // AI ile Karakter Görseli Üretme
  const generateAvatar = async () => {
    if (!character.appearance) {
      alert("Lütfen önce karakterin dış görünüşünü tanımla!");
      return;
    }
    setLoadingImage(true);
    try {
      const res = await fetch('/api/character/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${character.race} ${character.className}, ${character.appearance}, dnd style dark fantasy rpg portrait` })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setCharacter({ ...character, avatarUrl: data.imageUrl });
      }
    } catch (err) {
      alert("Görsel üretilirken bir hata oluştu.");
    } finally {
      setLoadingImage(false);
    }
  };

  // Oyuna Başla
  const startGame = () => {
    if (!character.name || !character.className) {
      alert("Lütfen en azından bir İsim ve Sınıf belirle!");
      return;
    }
    setStep('game');
  };

  if (step === 'game') {
    return (
      <div style={{ padding: '40px', color: '#fff', textAlign: 'center', background: '#0a0a0c', minHeight: '100vh' }}>
        <h1 style={{ color: '#d4af37' }}>⚔️ {character.name} - Maceraya Hazır!</h1>
        <p>Faz 2 (Silkroad Envanteri & Görevler) buraya entegre edilecek.</p>
        <button onClick={() => setStep('creation')} style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Karakter Oluşturmaya Dön
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#0d0c10', color: '#e0d8c3', minHeight: '100vh', padding: '30px', fontFamily: 'Georgia, serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#14121a', border: '2px solid #2e2620', borderRadius: '8px', padding: '30px', boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2e2620', paddingBottom: '15px', marginBottom: '25px' }}>
          <h1 style={{ margin: 0, color: '#d4af37', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="#d4af37" /> Karakter Oluşturma
          </h1>
          <button 
            onClick={generateRandomCharacter} 
            disabled={loadingAi}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#4a154b', border: '1px solid #7c227e', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Wand2 size={18} /> {loadingAi ? 'Zarlar Atılıyor...' : 'AI ile Rastgele Oluştur'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
          
          {/* SOL FORM ALANI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* İsim ve Irk */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Karakter Adı</label>
                <input 
                  type="text" 
                  value={character.name} 
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                  placeholder="Örn: Valerius" 
                  style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Irk Seçimi</label>
                <select 
                  value={character.race} 
                  onChange={(e) => setCharacter({ ...character, race: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '4px' }}
                >
                  {presetRaces.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Sınıf Seçimi / Özel Sınıf */}
            <div>
              <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Sınıf (Class)</label>
              <select 
                value={customClassMode ? 'Özel Sınıf Oluştur...' : character.className} 
                onChange={handleClassChange}
                style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '4px' }}
              >
                {presetClasses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              {customClassMode && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={character.className} 
                    onChange={(e) => setCharacter({ ...character, className: e.target.value })}
                    placeholder="Özel Sınıf Adı (Örn: Kan Büyücüsü)" 
                    style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #a82424', color: '#fff', borderRadius: '4px' }}
                  />
                  <textarea 
                    value={character.customClassDetails} 
                    onChange={(e) => setCharacter({ ...character, customClassDetails: e.target.value })}
                    placeholder="Sınıfın Özel Yetenekleri ve Özellikleri..." 
                    rows={2}
                    style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
              )}
            </div>

            {/* Görünüş Anlatımı */}
            <div>
              <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Dış Görünüş (Görsel İçin)</label>
              <textarea 
                value={character.appearance} 
                onChange={(e) => setCharacter({ ...character, appearance: e.target.value })}
                placeholder="Örn: Sol gözü yaralı, siyah pelerinli, elinde parlayan mavi bir asa taşıyan yaşlı büyücü..." 
                rows={3}
                style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '4px' }}
              />
            </div>

            {/* Backstory */}
            <div>
              <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Arka Plan Hikayesi (Backstory)</label>
              <textarea 
                value={character.backstory} 
                onChange={(e) => setCharacter({ ...character, backstory: e.target.value })}
                placeholder="Karakterinizin geçmişi, nereden geldiği ve motivasyonu..." 
                rows={4}
                style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '4px' }}
              />
            </div>

          </div>

          {/* SAĞ PANEL: AVATAR VE İSTATİSTİKLER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            
            {/* Avatar Kutusu */}
            <div style={{ width: '100%', height: '260px', background: '#0a0a0c', border: '2px dashed #3d322b', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              {character.avatarUrl ? (
                <img src={character.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#555', padding: '10px' }}>
                  <ImageIcon size={48} style={{ marginBottom: '10px' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Görünüşü anlatıp butonla portrait üretin</p>
                </div>
              )}
            </div>

            <button 
              onClick={generateAvatar} 
              disabled={loadingImage}
              style={{ width: '100%', padding: '10px', background: '#2a4225', border: '1px solid #3e6636', color: '#fff', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
            >
              <Sparkles size={16} /> {loadingImage ? 'Çizim Yapılıyor...' : 'Görseli Üret (AI)'}
            </button>

            {/* İstatistikler */}
            <div style={{ width: '100%', background: '#0a0a0c', border: '1px solid #2e2620', padding: '15px', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#d4af37', borderBottom: '1px solid #2e2620', paddingBottom: '5px', fontSize: '0.9rem' }}>🎲 Temel Temas Statları</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div>STR (Güç): <b>{character.stats.str}</b></div>
                <div>DEX (Becerililik): <b>{character.stats.dex}</b></div>
                <div>CON (Dayanıklılık): <b>{character.stats.con}</b></div>
                <div>INT (Zeka): <b>{character.stats.int}</b></div>
                <div>WIS (Bilgelik): <b>{character.stats.wis}</b></div>
                <div>CHA (Karizma): <b>{character.stats.cha}</b></div>
              </div>
            </div>

            {/* BAŞLA BUTONU */}
            <button 
              onClick={startGame}
              style={{ width: '100%', padding: '14px', background: '#8c2424', border: '1px solid #a82424', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginTop: 'auto' }}
            >
              Maceraya Başla ⚔️
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
