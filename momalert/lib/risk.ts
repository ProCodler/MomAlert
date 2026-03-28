export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export interface RiskInfo {
  level: RiskLevel;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  requiresEscalation: boolean;
  pulse: boolean;
  emoji: string;
  label: string;
}

export function extractRisk(text: string): RiskInfo {
  const match = text.match(/\[RISK:\s*(LOW|MEDIUM|HIGH|CRITICAL)\]/i);
  const level = (match?.[1]?.toUpperCase() as RiskLevel) ?? 'UNKNOWN';

  const riskMap: Record<RiskLevel, RiskInfo> = {
    LOW: {
      level: 'LOW',
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      requiresEscalation: false,
      pulse: false,
      emoji: '✅',
      label: 'LOW RISK',
    },
    MEDIUM: {
      level: 'MEDIUM',
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      requiresEscalation: false,
      pulse: false,
      emoji: '⚠️',
      label: 'MEDIUM RISK',
    },
    HIGH: {
      level: 'HIGH',
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      requiresEscalation: true,
      pulse: false,
      emoji: '🔶',
      label: 'HIGH RISK',
    },
    CRITICAL: {
      level: 'CRITICAL',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-900',
      requiresEscalation: true,
      pulse: true,
      emoji: '🚨',
      label: 'CRITICAL',
    },
    UNKNOWN: {
      level: 'UNKNOWN',
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      requiresEscalation: false,
      pulse: false,
      emoji: '❓',
      label: 'ASSESSING',
    },
  };

  return riskMap[level];
}

export function cleanResponseText(text: string): string {
  return text.replace(/\[RISK:\s*(LOW|MEDIUM|HIGH|CRITICAL|UNKNOWN)\]/gi, '').trim();
}
