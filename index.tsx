import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { User, MapPin, Heart, Trophy, ArrowRight, ArrowLeft, Download, Copy, RefreshCw, Edit, AlertCircle } from 'lucide-react';

// --- Tipos ---
interface Person {
  name: string;
  feeling: string;
}

interface Place {
  name: string;
  details: string;
}

interface Quality {
  name: string;
  example: string;
}

interface Memory {
  description: string;
  qualities: string;
}

interface UserData {
  userName: string;
  people: Person[];
  places: Place[];
  qualities: Quality[];
  memories: Memory[];
}

const INITIAL_DATA: UserData = {
  userName: '',
  people: [
    { name: '', feeling: '' },
    { name: '', feeling: '' },
    { name: '', feeling: '' }
  ],
  places: [
    { name: '', details: '' },
    { name: '', details: '' }
  ],
  qualities: [
    { name: '', example: '' },
    { name: '', example: '' },
    { name: '', example: '' }
  ],
  memories: [
    { description: '', qualities: '' },
    { description: '', qualities: '' }
  ]
};

const QUALITY_OPTIONS = [
  "Persistencia",
  "Creatividad",
  "Humor",
  "Sensibilidad",
  "Valentía",
  "Paciencia",
  "Empatía",
  "Inteligencia",
  "Adaptabilidad"
];

// --- Colores ---
const COLORS = {
  bg: '#faf5f0',
  primary: '#4a7c94', // Azul calmante
  accent: '#7cb08a',  // Verde suave
  text: '#2d3748',
  white: '#ffffff'
};

// --- Componente Principal ---
const App = () => {
  const [step, setStep] = useState(0); // 0: Welcome, 1-4: Wizard, 5: Result
  const [data, setData] = useState<UserData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar datos de LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem('mapaRecursosData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Preguntar si quiere continuar solo si hay datos relevantes
        const hasData = parsed.userName || parsed.people[0].name;
        if (hasData) {
          if (window.confirm("¿Continuar donde lo dejaste?")) {
            setData(parsed);
            // Intentar adivinar el paso basándose en los datos podría ser complejo, 
            // así que lo llevamos al paso 1 o al resumen si está completo
            // Por simplicidad, vamos al paso 1 si recuperamos.
            setStep(1); 
          } else {
             localStorage.removeItem('mapaRecursosData');
          }
        }
      } catch (e) {
        console.error("Error cargando datos", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Guardar datos en LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mapaRecursosData', JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const updateField = (section: keyof UserData, index: number | null, field: string, value: string) => {
    setData(prev => {
      if (index === null) {
        // Para campos directos como userName
        return { ...prev, [section]: value };
      }
      
      const newData = { ...prev };
      const list = [...(prev[section] as any[])];
      list[index] = { ...list[index], [field]: value };
      (newData[section] as any) = list;
      return newData;
    });
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  const handleReset = () => {
    if (window.confirm("¿Estás seguro/a? Se borrará todo tu progreso.")) {
      setData(INITIAL_DATA);
      setStep(0);
      localStorage.removeItem('mapaRecursosData');
    }
  };
  const handleEdit = () => setStep(1);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start" style={{ backgroundColor: COLORS.bg }}>
      
      {/* Header Simple */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
          {step === 0 ? "Bienvenido/a" : step === 5 ? "" : `Paso ${step} de 4`}
        </h1>
        {step > 0 && step < 5 && (
          <div className="w-64 h-2 bg-gray-200 rounded-full mt-2 mx-auto overflow-hidden">
            <div 
              className="h-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%`, backgroundColor: COLORS.accent }}
            />
          </div>
        )}
      </header>

      <div className="w-full max-w-2xl">
        {step === 0 && (
          <WelcomeScreen 
            userName={data.userName} 
            onChangeName={(val) => updateField('userName', null, '', val)}
            onStart={handleNext} 
          />
        )}
        
        {step === 1 && (
          <StepPeople data={data.people} updateData={(idx, field, val) => updateField('people', idx, field, val)} onNext={handleNext} />
        )}

        {step === 2 && (
          <StepPlaces data={data.places} updateData={(idx, field, val) => updateField('places', idx, field, val)} onNext={handleNext} onBack={handleBack} />
        )}

        {step === 3 && (
          <StepQualities data={data.qualities} updateData={(idx, field, val) => updateField('qualities', idx, field, val)} onNext={handleNext} onBack={handleBack} />
        )}

        {step === 4 && (
          <StepMemories data={data.memories} updateData={(idx, field, val) => updateField('memories', idx, field, val)} onNext={handleNext} onBack={handleBack} />
        )}

        {step === 5 && (
          <ResultScreen data={data} onReset={handleReset} onEdit={handleEdit} />
        )}
      </div>
    </div>
  );
};

// --- Componentes de Pantalla ---

const WelcomeScreen = ({ userName, onChangeName, onStart }: { userName: string, onChangeName: (v: string) => void, onStart: () => void }) => (
  <div className="bg-white rounded-3xl shadow-xl p-8 text-center animate-fade-in">
    <div className="text-6xl mb-6">🗺️</div>
    <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.primary }}>Tu Mapa de Recursos</h2>
    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
      Un recurso es cualquier cosa que te ayuda a regresar a tu <strong>Ventana de Tolerancia</strong> cuando te sientes desregulado/a.
      <br/><br/>
      Vamos a identificar <strong>TUS</strong> recursos para que estén disponibles cuando los necesites.
    </p>
    
    <div className="max-w-xs mx-auto mb-8">
       <label className="block text-left text-sm font-semibold mb-2 text-gray-500">Tu nombre (opcional):</label>
       <input 
        type="text" 
        value={userName}
        onChange={(e) => onChangeName(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7cb08a]"
        placeholder="¿Cómo te llamas?"
       />
    </div>

    <button 
      onClick={onStart}
      className="px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg transform transition hover:scale-105 active:scale-95"
      style={{ backgroundColor: COLORS.primary }}
    >
      Construir mi mapa
    </button>
  </div>
);

const StepPeople = ({ data, updateData, onNext }: { data: Person[], updateData: (i: number, f: string, v: string) => void, onNext: () => void }) => (
  <WizardStep
    icon={<User size={32} color={COLORS.primary} />}
    title="Personas que me hacen sentir seguro/a"
    description="¿Con quiénes puedes ser tú mismo/a? ¿Quiénes te calman con su presencia?"
    onNext={onNext}
    disableNext={!data[0].name} // Require at least one
  >
    {data.map((person, idx) => (
      <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="mb-3">
          <label className="block text-sm font-bold text-gray-600 mb-1">Persona {idx + 1}</label>
          <input 
            type="text" 
            value={person.name}
            onChange={(e) => updateData(idx, 'name', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4a7c94]"
            placeholder="Ej: Mi mamá, Juan, mi terapeuta..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">¿Qué sientes con esta persona?</label>
          <input 
            type="text" 
            value={person.feeling}
            onChange={(e) => updateData(idx, 'feeling', e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#4a7c94]"
            placeholder="Ej: Calma, aceptación, seguridad..."
          />
        </div>
      </div>
    ))}
    <p className="text-sm text-gray-400 text-center italic mt-2">Con una persona basta. Si tienes más, mejor.</p>
  </WizardStep>
);

const StepPlaces = ({ data, updateData, onNext, onBack }: { data: Place[], updateData: (i: number, f: string, v: string) => void, onNext: () => void, onBack: () => void }) => (
  <WizardStep
    icon={<MapPin size={32} color={COLORS.primary} />}
    title="Lugares donde me siento en paz"
    description="¿Dónde se relaja tu sistema nervioso? Pueden ser lugares reales o imaginarios."
    onNext={onNext}
    onBack={onBack}
    disableNext={!data[0].name}
  >
    {data.map((place, idx) => (
      <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="mb-3">
          <label className="block text-sm font-bold text-gray-600 mb-1">Lugar {idx + 1}</label>
          <input 
            type="text" 
            value={place.name}
            onChange={(e) => updateData(idx, 'name', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4a7c94]"
            placeholder="Ej: La playa, mi cuarto, el jardín..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">¿Qué lo hace especial?</label>
          <input 
            type="text" 
            value={place.details}
            onChange={(e) => updateData(idx, 'details', e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#4a7c94]"
            placeholder="Colores, olores, sonidos, sensaciones..."
          />
        </div>
      </div>
    ))}
    <p className="text-sm text-gray-400 text-center italic mt-2">Visualiza este lugar en detalle. Mientras más sentidos incluyas, más poderoso será.</p>
  </WizardStep>
);

const StepQualities = ({ data, updateData, onNext, onBack }: { data: Quality[], updateData: (i: number, f: string, v: string) => void, onNext: () => void, onBack: () => void }) => (
  <WizardStep
    icon={<Heart size={32} color={COLORS.primary} />}
    title="Cualidades y fortalezas que tengo"
    description="¿Qué fortalezas has demostrado en tu vida? Persistencia, creatividad, humor, sensibilidad..."
    onNext={onNext}
    onBack={onBack}
    disableNext={!data[0].name}
  >
    {data.map((quality, idx) => (
      <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="mb-3">
          <label className="block text-sm font-bold text-gray-600 mb-1">Cualidad {idx + 1}</label>
          <div className="relative">
            <input 
              list={`qualities-${idx}`}
              value={quality.name}
              onChange={(e) => updateData(idx, 'name', e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4a7c94]"
              placeholder="Selecciona o escribe una..."
            />
            <datalist id={`qualities-${idx}`}>
              {QUALITY_OPTIONS.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Un momento donde la demostré:</label>
          <input 
            type="text" 
            value={quality.example}
            onChange={(e) => updateData(idx, 'example', e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#4a7c94]"
            placeholder="Describe brevemente una situación..."
          />
        </div>
      </div>
    ))}
  </WizardStep>
);

const StepMemories = ({ data, updateData, onNext, onBack }: { data: Memory[], updateData: (i: number, f: string, v: string) => void, onNext: () => void, onBack: () => void }) => (
  <WizardStep
    icon={<Trophy size={32} color={COLORS.primary} />}
    title="Momentos donde demostré que podía"
    description="Recuerda momentos donde superaste algo difícil, lograste algo importante, o demostraste tu capacidad."
    onNext={onNext}
    onBack={onBack}
    nextLabel="Generar mi mapa"
    disableNext={!data[0].description}
  >
    {data.map((memory, idx) => (
      <div key={idx} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="mb-3">
          <label className="block text-sm font-bold text-gray-600 mb-1">Memoria {idx + 1}</label>
          <textarea
            value={memory.description}
            onChange={(e) => updateData(idx, 'description', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4a7c94] min-h-[80px]"
            placeholder="Describe el momento: ¿Qué pasó? ¿Qué lograste?"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">¿Qué cualidades usaste?</label>
          <input 
            type="text" 
            value={memory.qualities}
            onChange={(e) => updateData(idx, 'qualities', e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#4a7c94]"
            placeholder="Ej: Determinación, creatividad..."
          />
        </div>
      </div>
    ))}
    <p className="text-sm text-gray-400 text-center italic mt-2">Estas memorias son evidencia de que puedes manejar cosas difíciles.</p>
  </WizardStep>
);

const ResultScreen = ({ data, onReset, onEdit }: { data: UserData, onReset: () => void, onEdit: () => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const miniCardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (elementRef: React.RefObject<HTMLDivElement>, fileName: string) => {
    if (elementRef.current && (window as any).html2canvas) {
      try {
        const canvas = await (window as any).html2canvas(elementRef.current, {
            scale: 2, // Better resolution
            backgroundColor: null, // Transparent if needed, but our div has bg
            useCORS: true
        });
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        console.error("Error generating image", err);
        alert("Hubo un error generando la imagen. Por favor intenta de nuevo.");
      }
    } else {
        alert("La función de descarga no está disponible en este momento.");
    }
  };

  const copyToClipboard = () => {
    let text = `MAPA DE RECURSOS DE ${data.userName.toUpperCase() || 'MÍ'}\n\n`;
    text += `PERSONAS:\n${data.people.filter(p => p.name).map(p => `- ${p.name} (${p.feeling})`).join('\n')}\n\n`;
    text += `LUGARES:\n${data.places.filter(p => p.name).map(p => `- ${p.name}`).join('\n')}\n\n`;
    text += `CUALIDADES:\n${data.qualities.filter(p => p.name).map(p => `- ${p.name}`).join('\n')}\n\n`;
    text += `MEMORIAS:\n${data.memories.filter(p => p.description).map(p => `- ${p.description}`).join('\n')}`;
    
    navigator.clipboard.writeText(text);
    alert("Texto copiado al portapapeles ✨");
  };

  const hasPeople = data.people.some(p => p.name);
  const hasPlaces = data.places.some(p => p.name);
  const hasQualities = data.qualities.some(p => p.name);
  const hasMemories = data.memories.some(p => p.description);

  return (
    <div className="flex flex-col items-center animate-fade-in w-full pb-12">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.primary }}>✨ Tu Mapa de Recursos</h2>
      
      {/* --- TARJETA VISUAL --- */}
      <div 
        ref={cardRef} 
        className="w-full bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100"
        style={{ maxWidth: '600px' }}
      >
        <div className="p-6 md:p-8" style={{ background: `linear-gradient(135deg, ${COLORS.bg} 0%, #fff 100%)` }}>
            {/* Header Tarjeta */}
            <div className="border-b-2 border-[#4a7c94]/20 pb-4 mb-6 text-center">
                <h3 className="text-xl md:text-2xl font-bold tracking-wide" style={{ color: COLORS.primary }}>MI MAPA DE RECURSOS</h3>
                {data.userName && <p className="text-gray-500 font-medium mt-1">{data.userName}</p>}
            </div>

            <div className="space-y-6">
                {/* Personas */}
                {hasPeople && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <h4 className="flex items-center font-bold mb-2" style={{ color: COLORS.primary }}>
                            <User size={18} className="mr-2" /> MIS PERSONAS SEGURAS
                        </h4>
                        <ul className="space-y-2">
                            {data.people.filter(p => p.name).map((p, i) => (
                                <li key={i} className="text-sm md:text-base text-gray-700">
                                    <span className="font-semibold">{p.name}</span>
                                    {p.feeling && <span className="text-gray-500 italic"> - {p.feeling}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Lugares */}
                {hasPlaces && (
                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                        <h4 className="flex items-center font-bold mb-2" style={{ color: COLORS.primary }}>
                            <MapPin size={18} className="mr-2" /> MIS LUGARES DE PAZ
                        </h4>
                        <ul className="space-y-2">
                            {data.places.filter(p => p.name).map((p, i) => (
                                <li key={i} className="text-sm md:text-base text-gray-700">
                                    <span className="font-semibold">{p.name}</span>
                                    {p.details && <span className="text-gray-500 text-xs block pl-4">↳ {p.details}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Cualidades */}
                {hasQualities && (
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                        <h4 className="flex items-center font-bold mb-2" style={{ color: COLORS.primary }}>
                            <Heart size={18} className="mr-2" /> MIS CUALIDADES
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.qualities.filter(p => p.name).map((p, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-orange-200 rounded-full text-sm text-gray-700 font-medium shadow-sm">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Memorias */}
                {hasMemories && (
                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                        <h4 className="flex items-center font-bold mb-2" style={{ color: COLORS.primary }}>
                            <Trophy size={18} className="mr-2" /> MEMORIAS DE CAPACIDAD
                        </h4>
                         <ul className="space-y-3">
                            {data.memories.filter(p => p.description).map((p, i) => (
                                <li key={i} className="text-sm text-gray-700 bg-white/60 p-2 rounded-lg">
                                    "{p.description}"
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Footer Tarjeta */}
            <div className="mt-8 pt-4 border-t border-gray-200">
                 <div className="bg-[#4a7c94] text-white p-3 rounded-lg text-sm text-center shadow-sm">
                    <strong>🆘 EN MOMENTOS DIFÍCILES:</strong>
                    <div className="flex justify-around mt-2 text-xs md:text-sm">
                        <span>{data.people[0]?.name || "Respira"}</span>
                        <span>•</span>
                        <span>{data.places[0]?.name || "Observa"}</span>
                        <span>•</span>
                        <span>{data.qualities[0]?.name || "Confía"}</span>
                    </div>
                 </div>
                 <p className="text-center text-xs text-gray-400 mt-4">Generado el {new Date().toLocaleDateString()}</p>
            </div>
        </div>
      </div>

      {/* --- BOTONES DE ACCIÓN --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mb-10">
        <button onClick={() => handleDownload(cardRef, 'mi-mapa-recursos')} className="flex items-center justify-center p-3 bg-[#4a7c94] text-white rounded-lg font-bold shadow hover:bg-[#3b657a] transition">
            <Download size={18} className="mr-2" /> Descargar Mapa
        </button>
        <button onClick={copyToClipboard} className="flex items-center justify-center p-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition">
            <Copy size={18} className="mr-2" /> Copiar Texto
        </button>
        <button onClick={onEdit} className="flex items-center justify-center p-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition">
            <Edit size={18} className="mr-2" /> Editar
        </button>
        <button onClick={onReset} className="flex items-center justify-center p-3 bg-white border border-red-200 text-red-500 rounded-lg font-bold shadow-sm hover:bg-red-50 transition">
            <RefreshCw size={18} className="mr-2" /> Crear Nuevo
        </button>
      </div>

      {/* --- MINI KIT DE EMERGENCIA --- */}
      <div className="w-full max-w-sm">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Versión de Bolsillo</h3>
        <div 
            ref={miniCardRef}
            className="bg-[#2d3748] text-white p-6 rounded-xl shadow-lg relative overflow-hidden"
            style={{ minHeight: '300px' }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertCircle size={120} />
            </div>
            <h4 className="text-xl font-bold mb-6 flex items-center text-yellow-400">
                <AlertCircle className="mr-2" /> KIT DE CALMA
            </h4>
            
            <div className="space-y-4 relative z-10">
                <div>
                    <p className="text-xs text-gray-400 uppercase">Llama o busca a</p>
                    <p className="text-lg font-semibold">{data.people[0]?.name || "Alguien de confianza"}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase">Ve (mentalmente) a</p>
                    <p className="text-lg font-semibold">{data.places[0]?.name || "Tu lugar seguro"}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase">Recuerda tu</p>
                    <p className="text-lg font-semibold">{data.qualities[0]?.name || "Fortaleza"}</p>
                </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-400">
                "Esto también pasará"
            </div>
        </div>
        <button onClick={() => handleDownload(miniCardRef, 'kit-emergencia')} className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-[#4a7c94] underline">
            Descargar versión mini
        </button>
      </div>

      <p className="mt-12 text-center text-gray-500 italic max-w-md px-4">
        "Practica acceder a estos recursos cuando estés calmado/a. Así estarán disponibles cuando los necesites."
      </p>

    </div>
  );
};

// --- Wrapper del Wizard ---
const WizardStep = ({ 
    icon, 
    title, 
    description, 
    children, 
    onNext, 
    onBack,
    disableNext = false,
    nextLabel = "Siguiente"
}: any) => {
    return (
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 animate-fade-in relative">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-[#faf5f0] p-4 rounded-full mb-3">
                    {icon}
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: COLORS.primary }}>{title}</h2>
                <p className="text-gray-600 text-sm md:text-base">{description}</p>
            </div>

            <div className="mb-8">
                {children}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                {onBack ? (
                    <button 
                        onClick={onBack}
                        className="flex items-center px-4 py-2 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Atrás
                    </button>
                ) : <div />}
                
                <button 
                    onClick={onNext}
                    disabled={disableNext}
                    className={`flex items-center px-6 py-3 rounded-xl font-bold text-white shadow-md transition transform ${disableNext ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    style={{ backgroundColor: disableNext ? '#cbd5e0' : COLORS.accent }}
                >
                    {nextLabel} <ArrowRight size={20} className="ml-2" />
                </button>
            </div>
        </div>
    );
}

// Add simple fade animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
