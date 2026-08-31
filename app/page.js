"use client";
import { useState } from 'react';
import { 
  Wand2, Shield, Sparkles, Image as ImageIcon, 
  Backpack, Scroll, Users, Heart, Award, CheckCircle2, RotateCcw, Zap
} from 'lucide-react';

export default function Home() {
  const [step, setStep] = useState('creation'); // 'creation' veya 'game'
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [customClassMode, setCustomClassMode] = useState(false);
  
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

  // Silkroad Usulü Ekipman Slotları
  const [equipped, setEquipped] = useState({
    head: null,      // Kafa
    body: null,      // Gövde Zırhı
    legs: null,      // Pantolon/Bacak
    boots: null,     // Çizme
    mainHand: null,  // Ana Silah
    offHand: null,   // Sol El / Kalkan
    ring: null,      // Yüzük
    necklace: null,  // Kolye
  });

  // Grid Envanter (16 Slot)
  const [inventory, setInventory] = useState([
    { id: 1, name: "Paslı Kılıç", type: "mainHand", icon: "⚔️", bonus: { str: 3 }, description: "Klasik başlangıç kılıcı. (+3 STR)" },
    { id: 2, name: "Ahşap Kalkan", type: "offHand", icon: "🛡️", bonus: { con: 2 }, description: "Darbelere karşı basit koruma. (+2 CON)" },
    { id: 3, name: "Deri Gövdelik", type: "body", icon: "🥋", bonus: { con: 3 }, description: "Hafif ama sağlam deri zırh. (+3 CON)" },
    { id: 4, name: "Demir Miğfer", type: "head", icon: "🪖", bonus: { con: 1, str: 1 }, description: "Kafayı koruyan basit miğfer. (+1 STR, +1 CON)" },
    { id: 5, name: "Can İksiri", type: "consumable", icon: "🧪", bonus: {}, description: "Canı 25 puan yeniler." },
    { id: 6, name: "Yakut Yüzük", type: "ring", icon: "💍", bonus: { int: 4 }, description: "Gizemli parlaklığa sahip yüzük. (+4 INT)" },
    { id: 7, name: "Deri Çizme", type: "boots", icon: "🥾", bonus: { dex: 2 }, description: "Hızlı hareket etmeyi sağlar. (+2 DEX)" },
    null, null, null, null, null, null, null, null, null
  ]);

  // Görevler
  const [quests, setQuests] = useState([
    { id: 1, title: "Lonca Başkanının Çağrısı", status: "Aktif", desc: "Maceracılar lonca başkanı ile görüşüp ilk görevini al." },
    { id: 2, title: "Zindanın Gizemi", status: "Kilitli", desc: "Eski zindan kapısını bul ve içeriye girmeyi dene." }
  ]);

  // İlişkiler
  const [relations, setRelations] = useState([
    { name: "Maceracılar Loncası", status: "Dostça", level: 65, color: "#4CAF50" },
    { name: "Tavernacı Greg", status: "Nötr", level: 50, color: "#FFC107" },
    { name: "Kızıl El Kardeşliği", status: "Düşman", level: 10, color: "#F44336" }
  ]);

  const presetRaces = ['İnsan', 'Elf', 'Cüce', 'Ork', 'Buçukluk', 'Ejderdoğan'];
  const presetClasses = ['Savaşçı', 'Büyücü', 'Ranger (Avcı)', 'Rogue (Hırsız)', 'Ruhban', 'Özel Sınıf Oluştur...'];

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

  const generateRandomCharacter = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/character/generate', { method: 'POST' });
      const data = await res.json();
      if (data.character) {
        setCharacter(data.character);
        setCustomClassMode(!presetClasses.includes(data.character.className));
      }
    } catch (err) {
      alert("AI Karakter oluştururken bir hata oluştu.");
    } finally {
      setLoadingAi(false);
    }
  };

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
        body: JSON.stringify({ prompt: `${character.race} ${character.className}, ${character.appearance}, full body dnd rpg concept art` })
      });
      const data = await res.json();
      if (data.imageUrl) setCharacter({ ...character, avatarUrl: data.imageUrl });
    } catch (err) {
      alert("Görsel üretilirken bir hata oluştu.");
    } finally {
      setLoadingImage(false);
    }
  };

  // Eşya Giyme
  const equipItem = (item, inventoryIndex) => {
    if (!item || item.type === 'consumable') return;

    const targetSlot = item.type;
    const currentlyEquipped = equipped[targetSlot];

    const newInventory = [...inventory];
    newInventory[inventoryIndex] = currentlyEquipped;
    setInventory(newInventory);

    setEquipped({ ...equipped, [targetSlot]: item });
  };

  // Eşya Çıkarma
  const unequipItem = (slotName) => {
    const itemToUnequip = equipped[slotName];
    if (!itemToUnequip) return;

    const emptySlotIndex = inventory.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      alert("Çantanda boş yer yok!");
      return;
    }

    const newInventory = [...inventory];
    newInventory[emptySlotIndex] = itemToUnequip;
    setInventory(newInventory);

    setEquipped({ ...equipped, [slotName]: null });
  };

  const getCalculatedStats = () => {
    const total = { ...character.stats };
    Object.values(equipped).forEach(item => {
      if (item && item.bonus) {
        Object.keys(item.bonus).forEach(statKey => {
          if (total[statKey] !== undefined) total[statKey] += item.bonus[statKey];
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

  // ==================== SILKROAD STYLE OYUN EKRANI (FAZ 2) ====================
  if (step === 'game') {
    return (
      <div style={{ background: '#09080d', color: '#e0d8c3', minHeight: '100vh', padding: '20px', fontFamily: 'Georgia, serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '440px 1fr', gap: '20px' }}>
          
          {/* SOL PANEL: SILKROAD EKİPMAN & İSTETİSTİK EKRANI */}
          <div style={{ background: '#121018', border: '2px solid #3b2e23', borderRadius: '12px', padding: '18px', boxShadow: '0 8px 24px rgba(0,0,0,0.8)' }}>
            
            {/* Karakter Başlığı */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #2e241b', paddingBottom: '10px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, color: '#f0c040', fontSize: '1.4rem', textShadow: '0 2px 4px #000' }}>{character.name}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#a09484' }}>Lv. 1 • {character.race} • {character.className}</p>
            </div>

            {/* Can (HP) & Mana (MP) Barı */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                  <span><Heart size={12} color="#e53935" style={{ verticalAlign: 'middle' }} /> Can (HP)</span>
                  <span>100/100</span>
                </div>
                <div style={{ height: '8px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden', border: '1px solid #441111' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #b71c1c, #f44336)' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                  <span><Zap size={12} color="#1e88e5" style={{ verticalAlign: 'middle' }} /> Mana (MP)</span>
                  <span>80/80</span>
                </div>
                <div style={{ height: '8px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden', border: '1px solid #112244' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #0d47a1, #2196f3)' }}></div>
                </div>
              </div>
            </div>

            {/* SILKROAD USULÜ ORTADA KARAKTER SILUETI VE SAĞ/SOL SLOTLAR */}
            <div style={{ position: 'relative', width: '100%', height: '270px', background: '#08070a', border: '2px inset #2a2018', borderRadius: '8px', overflow: 'hidden', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              
              {/* SOL EKİPMAN SÜTUNU */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 2 }}>
                {[
                  { key: 'head', label: 'Miğfer', defaultIcon: '🪖' },
                  { key: 'body', label: 'Zırh', defaultIcon: '🥋' },
                  { key: 'legs', label: 'Bacak', defaultIcon: '👖' },
                  { key: 'boots', label: 'Çizme', defaultIcon: '🥾' },
                ].map(slot => (
                  <div 
                    key={slot.key}
                    onClick={() => unequipItem(slot.key)}
                    title={equipped[slot.key] ? `${equipped[slot.key].name} (Çıkarmak için tıkla)` : `${slot.label} (Boş)`}
                    style={{
                      width: '46px', height: '46px', background: equipped[slot.key] ? '#1a1622' : 'rgba(0,0,0,0.6)',
                      border: equipped[slot.key] ? '2px solid #f0c040' : '1px solid #443528',
                      borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: equipped[slot.key] ? 'pointer' : 'default', fontSize: '1.4rem', boxShadow: equipped[slot.key] ? '0 0 8px rgba(240,192,64,0.3)' : 'none'
                    }}
                  >
                    {equipped[slot.key] ? equipped[slot.key].icon : <span style={{ opacity: 0.2, fontSize: '1rem' }}>{slot.defaultIcon}</span>}
                  </div>
                ))}
              </div>

              {/* ORTADAKİ KARAKTER SILUETİ / GÖRSELİ */}
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '10px', bottom: '10px', width: '190px', border: '1px solid #3a2e24', borderRadius: '6px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {character.avatarUrl ? (
                  <img src={character.avatarUrl} alt="Karakter Görseli" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', opacity: 0.25, padding: '10px' }}>
                    <ImageIcon size={64} />
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem' }}>Siluet / Avatar</p>
                  </div>
                )}
              </div>

              {/* SAĞ EKİPMAN SÜTUNU */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 2 }}>
                {[
                  { key: 'mainHand', label: 'Silah', defaultIcon: '⚔️' },
                  { key: 'offHand', label: 'Kalkan', defaultIcon: '🛡️' },
                  { key: 'ring', label: 'Yüzük', defaultIcon: '💍' },
                  { key: 'necklace', label: 'Kolye', defaultIcon: '📿' },
                ].map(slot => (
                  <div 
                    key={slot.key}
                    onClick={() => unequipItem(slot.key)}
                    title={equipped[slot.key] ? `${equipped[slot.key].name} (Çıkarmak için tıkla)` : `${slot.label} (Boş)`}
                    style={{
                      width: '46px', height: '46px', background: equipped[slot.key] ? '#1a1622' : 'rgba(0,0,0,0.6)',
                      border: equipped[slot.key] ? '2px solid #f0c040' : '1px solid #443528',
                      borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: equipped[slot.key] ? 'pointer' : 'default', fontSize: '1.4rem', boxShadow: equipped[slot.key] ? '0 0 8px rgba(240,192,64,0.3)' : 'none'
                    }}
                  >
                    {equipped[slot.key] ? equipped[slot.key].icon : <span style={{ opacity: 0.2, fontSize: '1rem' }}>{slot.defaultIcon}</span>}
                  </div>
                ))}
              </div>

            </div>

            {/* İSTATİSTİKLER TABLOSU */}
            <div style={{ background: '#0a090e', border: '1px solid #2a2018', borderRadius: '6px', padding: '10px', marginBottom: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '0.8rem', textAlign: 'center' }}>
                <div style={{ background: '#14111b', padding: '4px', borderRadius: '4px' }}>STR: <b style={{ color: '#f0c040' }}>{calculatedStats.str}</b></div>
                <div style={{ background: '#14111b', padding: '4px', borderRadius: '4px' }}>DEX: <b style={{ color: '#f0c040' }}>{calculatedStats.dex}</b></div>
                <div style={{ background: '#14111b', padding: '4px', borderRadius: '4px' }}>CON: <b style={{ color: '#f0c040' }}>{calculatedStats.con}</b></div>
                <div style={{ background: '#14111b', padding: '4px', borderRadius: '4px' }}>INT: <b style={{ color: '#f0c040' }}>{calculatedStats.int}</b></div>
                <div style={{ background: '#14111b', padding: '4px', borderRadius: '4px' }}>WIS: <b style={{ color: '#f0c040' }}>{calculatedStats.wis}</b></div>
                <div style={{ background: '#14111b', padding: '4px', borderRadius: '4px' }}>CHA: <b style={{ color: '#f0c040' }}>{calculatedStats.cha}</b></div>
              </div>
            </div>

            <button 
              onClick={() => setStep('creation')}
              style={{ width: '100%', padding: '8px', background: '#221b16', border: '1px solid #443325', color: '#c0b0a0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <RotateCcw size={14} /> Karakter Ekranına Dön
            </button>
          </div>

          {/* SAĞ PANEL: DM HİKAYE EKRANI & SEKMELİ ALT PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* OYUN METİN ALANI */}
            <div style={{ background: '#121018', border: '2px solid #3b2e23', borderRadius: '12px', padding: '20px', minHeight: '220px', boxShadow: '0 8px 24px rgba(0,0,0,0.8)' }}>
              <h3 style={{ color: '#f0c040', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                <Scroll size={20} /> Hikaye ve DM Akışı
              </h3>
              <p style={{ color: '#d0c4b4', lineHeight: '1.6', fontSize: '0.95rem' }}>
                <i>"Maceracılar loncasının meşalelerle aydınlatılmış kasvetli salonunda duruyorsun. Lonca başkanı masasında duran eski haritayı inceledikten sonra başını kaldırıp sana bakıyor: '{character.name}, aldığımız haberlere göre kuzeydeki zindanda garip olaylar dönüyor. Ekipmanlarını kuşan ve oraya hareket et...'"</i>
              </p>
              <div style={{ marginTop: '15px', padding: '10px', background: '#0a090e', borderLeft: '3px solid #f0c040', fontSize: '0.85rem', color: '#998d7d' }}>
                💡 <b>Faz 3 Entegrasyonu:</b> Zarlar, DC zorluk sınıfları ve dinamik yapay zeka seçenekleri bir sonraki fazda buraya eklenecektir.
              </div>
            </div>

            {/* SEKMELER (ENVANTER ÇANTASI / GÖREVLER / İLİŞKİLER) */}
            <div style={{ background: '#121018', border: '2px solid #3b2e23', borderRadius: '12px', overflow: 'hidden' }}>
              
              <div style={{ display: 'flex', background: '#09080d', borderBottom: '2px solid #2e241b' }}>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  style={{ flex: 1, padding: '12px', background: activeTab === 'inventory' ? '#121018' : 'transparent', border: 'none', color: activeTab === 'inventory' ? '#f0c040' : '#776c5f', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Backpack size={16} /> Çanta (Silkroad Inventory)
                </button>
                <button 
                  onClick={() => setActiveTab('quests')}
                  style={{ flex: 1, padding: '12px', background: activeTab === 'quests' ? '#121018' : 'transparent', border: 'none', color: activeTab === 'quests' ? '#f0c040' : '#776c5f', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Award size={16} /> Görevler
                </button>
                <button 
                  onClick={() => setActiveTab('relations')}
                  style={{ flex: 1, padding: '12px', background: activeTab === 'relations' ? '#121018' : 'transparent', border: 'none', color: activeTab === 'relations' ? '#f0c040' : '#776c5f', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Users size={16} /> İlişkiler
                </button>
              </div>

              <div style={{ padding: '18px' }}>
                {/* 1. SILKROAD STYLE GRID ÇANTA */}
                {activeTab === 'inventory' && (
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#887c6e', marginTop: 0 }}>Giyebileceğin eşyalara tıklayarak karakterin üzerine takabilirsin.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
                      {inventory.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => item && equipItem(item, idx)}
                          title={item ? `${item.name}\n${item.description}` : 'Boş Slot'}
                          style={{
                            height: '65px', background: '#09080d', border: item ? '1px solid #f0c040' : '1px solid #2a2018',
                            borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: item ? 'pointer' : 'default', position: 'relative', boxShadow: item ? 'inset 0 0 6px rgba(240,192,64,0.1)' : 'none'
                          }}
                        >
                          {item ? (
                            <>
                              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                              <span style={{ fontSize: '0.65rem', color: '#b5a895', marginTop: '2px', textAlign: 'center', padding: '0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.name}</span>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.65rem', color: '#332920' }}>{idx + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. GÖREV LOGU */}
                {activeTab === 'quests' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {quests.map(q => (
                      <div key={q.id} style={{ padding: '10px', background: '#09080d', border: '1px solid #2a2018', borderRadius: '6px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <CheckCircle2 size={18} color={q.status === 'Aktif' ? '#f0c040' : '#444'} style={{ marginTop: '2px' }} />
                        <div>
                          <h4 style={{ margin: 0, color: q.status === 'Aktif' ? '#fff' : '#666', fontSize: '0.95rem' }}>{q.title} <span style={{ fontSize: '0.7rem', padding: '1px 5px', background: '#1c1712', borderRadius: '4px', color: '#f0c040', marginLeft: '6px' }}>{q.status}</span></h4>
                          <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#887c6e' }}>{q.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. İLİŞKİLER */}
                {activeTab === 'relations' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {relations.map((rel, idx) => (
                      <div key={idx} style={{ background: '#09080d', padding: '10px', borderRadius: '6px', border: '1px solid #2a2018' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                          <span><b>{rel.name}</b></span>
                          <span style={{ color: rel.color }}>{rel.status} ({rel.level}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#1a1612', borderRadius: '3px', overflow: 'hidden' }}>
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
    <div style={{ background: '#09080d', color: '#e0d8c3', minHeight: '100vh', padding: '30px', fontFamily: 'Georgia, serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: '#121018', border: '2px solid #3b2e23', borderRadius: '12px', padding: '25px', boxShadow: '0 8px 24px rgba(0,0,0,0.8)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2e241b', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#f0c040', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="#f0c040" /> Karakter Oluşturma
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: '#a09484', marginBottom: '5px', fontSize: '0.9rem' }}>Karakter Adı</label>
                <input 
                  type="text" 
                  value={character.name} 
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                  placeholder="Örn: Valerius"
                  style={{ width: '100%', padding: '10px', background: '#09080d', border: '1px solid #3b2e23', color: '#fff', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#a09484', marginBottom: '5px', fontSize: '0.9rem' }}>Irk Seçimi</label>
                <select 
                  value={character.race} 
                  onChange={(e) => setCharacter({ ...character, race: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#09080d', border: '1px solid #3b2e23', color: '#fff', borderRadius: '6px' }}
                >
                  {presetRaces.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#a09484', marginBottom: '5px', fontSize: '0.9rem' }}>Sınıf (Class)</label>
              <select 
                value={customClassMode ? 'Özel Sınıf Oluştur...' : character.className} 
                onChange={handleClassChange}
                style={{ width: '100%', padding: '10px', background: '#09080d', border: '1px solid #3b2e23', color: '#fff', borderRadius: '6px' }}
              >
                {presetClasses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              {customClassMode && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={character.className} 
                    onChange={(e) => setCharacter({ ...character, className: e.target.value })}
                    placeholder="Özel Sınıf Adı"
                    style={{ width: '100%', padding: '10px', background: '#09080d', border: '1px solid #a82424', color: '#fff', borderRadius: '6px' }}
                  />
                  <textarea 
                    value={character.customClassDetails} 
                    onChange={(e) => setCharacter({ ...character, customClassDetails: e.target.value })}
                    placeholder="Sınıfın Özel Yetenekleri..."
                    rows={2}
                    style={{ width: '100%', padding: '10px', background: '#09080d', border: '1px solid #3b2e23', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', color: '#a09484', marginBottom: '5px', fontSize: '0.9rem' }}>Dış Görünüş (Prompt)</label>
              <textarea 
                value={character.appearance} 
                onChange={(e) => setCharacter({ ...character, appearance: e.target.value })}
                placeholder="Örn: Sol gözü yaralı, siyah pelerinli büyücü..."
                rows={3}
                style={{ width: '100%', padding: '10px', background: '#09080d', border: '1px solid #3b2e23', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#a09484', marginBottom: '5px', fontSize: '0.9rem' }}>Arka Plan (Backstory)</label>
              <textarea 
                value={character.backstory} 
                onChange={(e) => setCharacter({ ...character, backstory: e.target.value })}
                placeholder="Karakterinizin geçmişi..."
                rows={4}
                style={{ width: '100%', padding: '10px', background: '#09080d', border: '1px solid #3b2e23', color: '#fff', borderRadius: '6px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '260px', background: '#09080d', border: '2px dashed #3b2e23', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

            <div style={{ width: '100%', background: '#09080d', border: '1px solid #3b2e23', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#f0c040', borderBottom: '1px solid #2e241b', paddingBottom: '5px' }}>Temel Statlar</h4>
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
