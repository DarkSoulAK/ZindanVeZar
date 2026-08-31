"use client";
import { useState } from 'react';
import { 
  Wand2, Shield, Sparkles, Image as ImageIcon, 
  Backpack, Scroll, Users, Sword, Heart, Award, CheckCircle2, RotateCcw
} from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState('creation'); // 'creation' veya 'game'
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [customClassMode, setCustomClassMode] = useState(false);
  
  // Aktif Sekme (Envanter, Görevler, İlişkiler)
  const [activeTab, setActiveTab] = useState('inventory');

  // Karakter Durumu (State)
  const [character, setCharacter] = useState({
    name: '',
    race: 'İnsan',
    className: 'Savaşçı',
    customClassDetails: '',
    backstory: '',
    appearance: '',
    avatarUrl: '',
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
  });

  // Ekipman Slotları (Karakterin Üstündekiler)
  const [equipped, setEquipped] = useState({
    head: null,
    body: null,
    mainHand: null,
    offHand: null,
    accessory: null,
  });

  // Grid Envanter (Silkroad Kutucuklu Çanta - 16 Slot)
  const [inventory, setInventory] = useState([
    { id: 1, name: "Paslı Kısa Kılıç", type: "mainHand", icon: "⚔️", bonus: { str: 2 }, description: "Eski ama keskin bir kılıç. (+2 STR)" },
    { id: 2, name: "Deri Zırh", type: "body", icon: "🛡️", bonus: { con: 2 }, description: "Temel koruma sağlayan basit zırh. (+2 CON)" },
    { id: 3, name: "Can İksiri", type: "consumable", icon: "🧪", bonus: {}, description: "Canı 20 yeniler." },
    { id: 4, name: "Sihirli Yüzük", type: "accessory", icon: "💍", bonus: { int: 3 }, description: "Hafif mavi ışık saçan bir yüzük. (+3 INT)" },
    null, null, null, null,
    null, null, null, null,
    null, null, null, null,
  ]);

  // Görevler (Quest Log)
  const [quests, setQuests] = useState([
    { id: 1, title: "Lonca Başkanının Çağrısı", status: "Active", desc: "Maceracılar lonca başkanı ile görüşüp ilk görevini al." },
    { id: 2, title: "Zindanın Gizemi", status: "Locked", desc: "Eski zindan kapısını bul ve içeriye girmeyi dene." }
  ]);

  // NPC / Lonca İlişkileri (Reputation)
  const [relations, setRelations] = useState([
    { name: "Maceracılar Loncası", status: "Dostça", level: 65, color: "#4CAF50" },
    { name: "Tavernacı Greg", status: "Nötr", level: 50, color: "#FFC107" },
    { name: "Kızıl El Kardeşliği", status: "Düşman", level: 10, color: "#F44336" }
  ]);

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
    try {
      setLoadingImage(true);
      const res = await fetch('/api/character/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${character.race} ${character.className}, ${character.appearance}, dnd style` })
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

  // Eşya Giyme (Equip Item)
  const equipItem = (item, inventoryIndex) => {
    if (!item || item.type === 'consumable') return;

    const targetSlot = item.type;
    const currentlyEquipped = equipped[targetSlot];

    // Üstteki ve çantadaki eşyaları takas et
    const newInventory = [...inventory];
    newInventory[inventoryIndex] = currentlyEquipped;
    setInventory(newInventory);

    setEquipped({
      ...equipped,
      [targetSlot]: item
    });
  };

  // Eşya Çıkarma (Unequip Item)
  const unequipItem = (slotName) => {
    const itemToUnequip = equipped[slotName];
    if (!itemToUnequip) return;

    // Boş slot bul
    const emptySlotIndex = inventory.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      alert("Çantanda boş yer yok!");
      return;
    }

    const newInventory = [...inventory];
    newInventory[emptySlotIndex] = itemToUnequip;
    setInventory(newInventory);

    setEquipped({
      ...equipped,
      [slotName]: null
    });
  };

  // Bonusu Dahil Stat Hesaplama
  const getCalculatedStats = () => {
    const total = { ...character.stats };
    Object.values(equipped).forEach(item => {
      if (item && item.bonus) {
        Object.keys(item.bonus).forEach(statKey => {
          if (total[statKey] !== undefined) {
            total[statKey] += item.bonus[statKey];
          }
        });
      }
    });
    return total;
  };

  const calculatedStats = getCalculatedStats();

  const startGame = () => {
    if (!character.name || !character.className) {
      alert("Lütfen en azından bir İsim ve Sınıf belirle!");
      return;
    }
    setStep('game');
  };

  // ==================== OYUN EKRANI (FAZ 2) ====================
  if (step === 'game') {
    return (
      <div style={{ background: '#0d0c10', color: '#e0d8c3', minHeight: '100vh', padding: '20px', fontFamily: 'Georgia, serif' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
          
          {/* SOL PANEL: KARAKTER KARTI & STATLAR */}
          <div style={{ background: '#14121a', border: '2px solid #2e2620', borderRadius: '12px', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ width: '120px', height: '120px', margin: '0 auto 10px auto', borderRadius: '50%', border: '2px solid #d4af37', overflow: 'hidden', background: '#0a0a0c' }}>
                {character.avatarUrl ? (
                  <img src={character.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ lineHeight: '120px', color: '#555' }}>Görsel Yok</div>
                )}
              </div>
              <h2 style={{ margin: 0, color: '#d4af37', fontSize: '1.4rem' }}>{character.name}</h2>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#b5a895' }}>{character.race} • {character.className}</p>
            </div>

            {/* Can Barı */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span><Heart size={14} color="#e53935" style={{ verticalAlign: 'middle' }} /> Can (HP)</span>
                <span>100 / 100</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#222', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#e53935' }}></div>
              </div>
            </div>

            {/* Giyilen Ekipman Slotları */}
            <h4 style={{ color: '#d4af37', borderBottom: '1px solid #2e2620', paddingBottom: '5px', marginTop: 0 }}>Giyilen Eşyalar</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {[
                { label: 'Kafa', key: 'head' },
                { label: 'Zırh', key: 'body' },
                { label: 'Silah', key: 'mainHand' },
                { label: 'Sol El', key: 'offHand' },
                { label: 'Takı', key: 'accessory' }
              ].map(slot => (
                <div 
                  key={slot.key}
                  onClick={() => unequipItem(slot.key)}
                  title={equipped[slot.key] ? `${equipped[slot.key].name} (Çıkarmak için tıkla)` : `${slot.label} (Boş)`}
                  style={{
                    height: '55px', background: '#0a0a0c', border: equipped[slot.key] ? '1px solid #d4af37' : '1px dashed #3d322b',
                    borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: equipped[slot.key] ? 'pointer' : 'default', fontSize: '1.2rem', position: 'relative'
                  }}
                >
                  {equipped[slot.key] ? equipped[slot.key].icon : <span style={{ fontSize: '0.65rem', color: '#555' }}>{slot.label}</span>}
                </div>
              ))}
            </div>

            {/* Dinamik Statlar */}
            <h4 style={{ color: '#d4af37', borderBottom: '1px solid #2e2620', paddingBottom: '5px', marginTop: 0 }}>İstatistikler</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
              <div>STR (Güç): <b>{calculatedStats.str}</b></div>
              <div>DEX (Beceri): <b>{calculatedStats.dex}</b></div>
              <div>CON (Dayanık.): <b>{calculatedStats.con}</b></div>
              <div>INT (Zeka): <b>{calculatedStats.int}</b></div>
              <div>WIS (Bilgelik): <b>{calculatedStats.wis}</b></div>
              <div>CHA (Karizma): <b>{calculatedStats.cha}</b></div>
            </div>

            <button 
              onClick={() => setStep('creation')}
              style={{ width: '100%', marginTop: '20px', padding: '10px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} /> Karakter Ekranına Dön
            </button>
          </div>

          {/* SAĞ PANEL: HİKAYE & ENVANTER/GÖREV/İLİŞKİ SEKMELERİ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* ÜST HİKAYE EKRANI (Faz 3'te AI DM burayı dolduracak) */}
            <div style={{ background: '#14121a', border: '2px solid #2e2620', borderRadius: '12px', padding: '20px', minHeight: '220px' }}>
              <h3 style={{ color: '#d4af37', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scroll size={20} /> Oyun Alanı (DM Hikaye Anlatımı)
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                <i>"Maceracılar loncasının meşalelerle aydınlatılmış kasvetli salonunda duruyorsun. Lonca başkanı masasında duran eski haritayı inceledikten sonra başını kaldırıp sana bakıyor: '{character.name}, aldığımız haberlere göre kuzeydeki eski zindanda garip şeyler oluyor. Git ve orayı araştır...'"</i>
              </p>
              <div style={{ marginTop: '15px', padding: '10px', background: '#0a0a0c', borderLeft: '4px solid #d4af37', fontSize: '0.9rem', color: '#aaa' }}>
                💡 <b>Faz 3 Entegrasyonu:</b> Yapay zeka DM seçenekleri ve zarlı aksiyonları bu alana sunacaktır.
              </div>
            </div>

            {/* ALT SEKMELİ PANEL (ENVANTER, GÖREVLER, İLİŞKİLER) */}
            <div style={{ background: '#14121a', border: '2px solid #2e2620', borderRadius: '12px', overflow: 'hidden' }}>
              
              {/* Sekme Butonları */}
              <div style={{ display: 'flex', background: '#0a0a0c', borderBottom: '2px solid #2e2620' }}>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  style={{ flex: 1, padding: '12px', background: activeTab === 'inventory' ? '#14121a' : 'transparent', border: 'none', color: activeTab === 'inventory' ? '#d4af37' : '#777', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Backpack size={18} /> Envanter (Silkroad Grid)
                </button>
                <button 
                  onClick={() => setActiveTab('quests')}
                  style={{ flex: 1, padding: '12px', background: activeTab === 'quests' ? '#14121a' : 'transparent', border: 'none', color: activeTab === 'quests' ? '#d4af37' : '#777', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Award size={18} /> Görev Logu
                </button>
                <button 
                  onClick={() => setActiveTab('relations')}
                  style={{ flex: 1, padding: '12px', background: activeTab === 'relations' ? '#14121a' : 'transparent', border: 'none', color: activeTab === 'relations' ? '#d4af37' : '#777', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Users size={18} /> İlişkiler & Rep
                </button>
              </div>

              {/* SEKME İÇERİKLERİ */}
              <div style={{ padding: '20px' }}>
                
                {/* 1. ENVANTER SEKMESİ */}
                {activeTab === 'inventory' && (
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: 0 }}>Giyebilmek için eşyaların üzerine tıkla. Silah/Zırh eşyaları karakter statlarına doğrudan eklenir.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
                      {inventory.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => item && equipItem(item, idx)}
                          title={item ? `${item.name}\n${item.description}` : 'Boş Slot'}
                          style={{
                            height: '70px', background: '#0a0a0c', border: item ? '1px solid #d4af37' : '1px solid #222',
                            borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: item ? 'pointer' : 'default', transition: 'all 0.2s ease', position: 'relative'
                          }}
                        >
                          {item ? (
                            <>
                              <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                              <span style={{ fontSize: '0.65rem', color: '#b5a895', marginTop: '2px', textAlign: 'center', padding: '0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.name}</span>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#333' }}>{idx + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. GÖREV LOGU SEKMESİ */}
                {activeTab === 'quests' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {quests.map(q => (
                      <div key={q.id} style={{ padding: '12px', background: '#0a0a0c', border: '1px solid #2e2620', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CheckCircle2 size={20} color={q.status === 'Active' ? '#d4af37' : '#555'} style={{ marginTop: '2px' }} />
                        <div>
                          <h4 style={{ margin: 0, color: q.status === 'Active' ? '#fff' : '#777' }}>{q.title} <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#222', borderRadius: '4px', color: '#d4af37', marginLeft: '8px' }}>{q.status}</span></h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#aaa' }}>{q.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. İLİŞKİLER SEKMESİ */}
                {activeTab === 'relations' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {relations.map((rel, idx) => (
                      <div key={idx} style={{ background: '#0a0a0c', padding: '12px', borderRadius: '8px', border: '1px solid #2e2620' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                          <span><b>{rel.name}</b></span>
                          <span style={{ color: rel.color }}>{rel.status} ({rel.level}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${rel.level}%`, height: '100%', background: rel.color }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // ==================== KARAKTER OLUŞTURMA EKRANI (FAZ 1) ====================
  return (
    <div style={{ background: '#0d0c10', color: '#e0d8c3', minHeight: '100vh', padding: '30px', fontFamily: 'Georgia, serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#14121a', border: '2px solid #2e2620', borderRadius: '12px', padding: '25px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2e2620', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#d4af37', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="#d4af37" /> Karakter Oluşturma
          </h1>
          <button 
            onClick={generateRandomCharacter}
            disabled={loadingAi}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#4a154b', border: '1px solid #6b1f6e', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Wand2 size={18} /> {loadingAi ? 'Zarlar Atılıyor...' : 'AI ile Rastgele Oluştur'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
          
          {/* SOL FORM ALANI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Karakter Adı</label>
                <input 
                  type="text" 
                  value={character.name} 
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                  placeholder="Örn: Valerius"
                  style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Irk Seçimi</label>
                <select 
                  value={character.race} 
                  onChange={(e) => setCharacter({ ...character, race: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '6px' }}
                >
                  {presetRaces.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Sınıf (Class)</label>
              <select 
                value={customClassMode ? 'Özel Sınıf Oluştur...' : character.className} 
                onChange={handleClassChange}
                style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '6px' }}
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
                    style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #a82424', color: '#fff', borderRadius: '6px' }}
                  />
                  <textarea 
                    value={character.customClassDetails} 
                    onChange={(e) => setCharacter({ ...character, customClassDetails: e.target.value })}
                    placeholder="Sınıfın Özel Yetenekleri..."
                    rows={2}
                    style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Dış Görünüş (Prompt)</label>
              <textarea 
                value={character.appearance} 
                onChange={(e) => setCharacter({ ...character, appearance: e.target.value })}
                placeholder="Örn: Sol gözü yaralı, siyah pelerinli büyücü..."
                rows={3}
                style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#b5a895', marginBottom: '5px', fontSize: '0.9rem' }}>Arka Plan (Backstory)</label>
              <textarea 
                value={character.backstory} 
                onChange={(e) => setCharacter({ ...character, backstory: e.target.value })}
                placeholder="Karakterinizin geçmişi..."
                rows={4}
                style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #3d322b', color: '#fff', borderRadius: '6px' }}
              />
            </div>
          </div>

          {/* SAĞ PANEL: AVATAR VE İSTATİSTİKLER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '260px', background: '#0a0a0c', border: '2px dashed #3d322b', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              style={{ width: '100%', padding: '10px', background: '#2a4225', border: '1px solid #3e6636', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Sparkles size={16} /> {loadingImage ? 'Çizim Yapılıyor...' : 'Görseli Üret (AI)'}
            </button>

            <div style={{ width: '100%', background: '#0a0a0c', border: '1px solid #2e2620', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#d4af37', borderBottom: '1px solid #2e2620', paddingBottom: '5px' }}>Temel Statlar</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div>STR: <b>{character.stats.str}</b></div>
                <div>DEX: <b>{character.stats.dex}</b></div>
                <div>CON: <b>{character.stats.con}</b></div>
                <div>INT: <b>{character.stats.int}</b></div>
                <div>WIS: <b>{character.stats.wis}</b></div>
                <div>CHA: <b>{character.stats.cha}</b></div>
              </div>
            </div>

            <button 
              onClick={startGame}
              style={{ width: '100%', padding: '14px', background: '#8c2424', border: '1px solid #a82424', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              Maceraya Başla
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
