import { useTranslation } from 'react-i18next';

interface LayerVisualizationProps {
  currentLayer: number;
  className?: string;
}

const SEGMENT_LAYERS = [
  { name: 'soil', colorFrom: '#5d4a35', label: '1-10', depthRange: [1, 10] },
  { name: 'sand', colorFrom: '#9c8050', label: '11-25', depthRange: [11, 25] },
  { name: 'gravel', colorFrom: '#7a6b58', label: '26-35', depthRange: [26, 35] },
  { name: 'clay', colorFrom: '#6e4d3c', label: '36-50', depthRange: [36, 50] },
  { name: 'limestone', colorFrom: '#9a9382', label: '51-60', depthRange: [51, 60] },
  { name: 'sandstone', colorFrom: '#a87850', label: '61-70', depthRange: [61, 70] },
  { name: 'granite', colorFrom: '#4a4540', label: '71-80', depthRange: [71, 80] },
  { name: 'diamond_layer', colorFrom: '#2a3a4a', label: '81-90', depthRange: [81, 90] },
  { name: 'magma', colorFrom: '#5a1a0a', label: '91-95', depthRange: [91, 95] },
  { name: 'core', colorFrom: '#ff7a2a', label: '96-100', depthRange: [96, 100] },
];

function getActiveSegment(layer: number): number {
  for (let i = 0; i < SEGMENT_LAYERS.length; i++) {
    const [min, max] = SEGMENT_LAYERS[i].depthRange;
    if (layer >= min && layer <= max) return i;
  }
  return 0;
}

export default function LayerVisualization({ currentLayer, className = '' }: LayerVisualizationProps) {
  const { t } = useTranslation();
  const activeIdx = getActiveSegment(currentLayer);

  return (
    <div className={`flex gap-1.5 ${className}`}>
      {SEGMENT_LAYERS.map((seg, idx) => {
        const isActive = idx === activeIdx;
        const isPast = idx < activeIdx;
        return (
          <div
            key={seg.name}
            className={`relative flex-1 rounded transition-all ${
              isActive ? 'ring-2 ring-amber-400 scale-105' : ''
            }`}
            style={{ height: '70px' }}
          >
            <div
              className={`w-full h-full rounded transition-all duration-300 ${
                isPast ? 'opacity-60' : isActive ? 'opacity-100' : 'opacity-30'
              }`}
              style={{ backgroundColor: seg.colorFrom }}
            />
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold drop-shadow">⛏️</span>
              </div>
            )}
            <div
              className={`absolute -bottom-5 left-0 right-0 text-center text-xs leading-tight ${
                isActive ? 'text-amber-400 font-bold' : 'text-stone-600'
              }`}
            >
              {t(`layers.${seg.name}`).slice(0, 3)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
