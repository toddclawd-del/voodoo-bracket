import { useState, useEffect } from 'react'

// Voodoo Ranger-inspired March Madness Bracket - 64 Teams
// Colors: Dark base, neon lime green, orange, purple accents

interface Team {
  seed: number
  name: string
  record?: string
}

interface Matchup {
  id: string
  team1: Team | null
  team2: Team | null
  winner: Team | null
  round: number
  region?: string
}

const VOODOO_COLORS = {
  black: '#0D0D0D',
  darkGray: '#1A1A1A',
  charcoal: '#2D2D2D',
  lime: '#00FF41',
  limeGlow: '#00FF4180',
  orange: '#FF6B00',
  purple: '#9B00FF',
  white: '#FFFFFF',
  gray: '#888888',
}

const ROUNDS = [
  'Round of 64',
  'Round of 32', 
  'Sweet 16',
  'Elite 8',
  'Final Four',
  'Championship',
  'Champion'
]

// Current top 64 teams (January 2026 - based on AP Poll + Bracketology)
const REGIONS = {
  south: [
    { seed: 1, name: 'Arizona', record: '20-0' },
    { seed: 16, name: 'Norfolk St', record: '14-8' },
    { seed: 8, name: 'Iowa State', record: '18-2' },
    { seed: 9, name: 'Oklahoma', record: '14-6' },
    { seed: 5, name: 'BYU', record: '17-2' },
    { seed: 12, name: 'UC Irvine', record: '17-4' },
    { seed: 4, name: 'Illinois', record: '17-3' },
    { seed: 13, name: 'Vermont', record: '17-5' },
    { seed: 6, name: 'Arkansas', record: '15-5' },
    { seed: 11, name: 'Texas A&M', record: '13-7' },
    { seed: 3, name: 'Michigan St', record: '18-2' },
    { seed: 14, name: 'Colgate', record: '16-4' },
    { seed: 7, name: 'Vanderbilt', record: '17-3' },
    { seed: 10, name: 'NC State', record: '14-6' },
    { seed: 2, name: 'Duke', record: '18-1' },
    { seed: 15, name: 'UNC Asheville', record: '15-6' },
  ],
  east: [
    { seed: 1, name: 'UConn', record: '19-1' },
    { seed: 16, name: 'Stony Brook', record: '13-7' },
    { seed: 8, name: 'Kansas', record: '15-5' },
    { seed: 9, name: 'Louisville', record: '14-5' },
    { seed: 5, name: 'Houston', record: '17-2' },
    { seed: 12, name: 'New Mexico', record: '16-5' },
    { seed: 4, name: 'Purdue', record: '17-3' },
    { seed: 13, name: 'High Point', record: '18-4' },
    { seed: 6, name: 'Virginia', record: '16-3' },
    { seed: 11, name: 'SMU', record: '14-5' },
    { seed: 3, name: 'Gonzaga', record: '21-1' },
    { seed: 14, name: 'Lipscomb', record: '15-5' },
    { seed: 7, name: 'Clemson', record: '17-4' },
    { seed: 10, name: 'Auburn', record: '13-6' },
    { seed: 2, name: 'Michigan', record: '18-1' },
    { seed: 15, name: 'Robert Morris', record: '14-6' },
  ],
  midwest: [
    { seed: 1, name: 'Nebraska', record: '20-0' },
    { seed: 16, name: 'SE Missouri', record: '12-8' },
    { seed: 8, name: 'St. John\'s', record: '15-5' },
    { seed: 9, name: 'Georgia', record: '14-6' },
    { seed: 5, name: 'Texas Tech', record: '16-4' },
    { seed: 12, name: 'Drake', record: '17-5' },
    { seed: 4, name: 'N Carolina', record: '16-4' },
    { seed: 13, name: 'Akron', record: '16-4' },
    { seed: 6, name: 'Florida', record: '14-6' },
    { seed: 11, name: 'Xavier', record: '13-7' },
    { seed: 3, name: 'Iowa', record: '14-5' },
    { seed: 14, name: 'Montana', record: '16-5' },
    { seed: 7, name: 'Saint Louis', record: '19-1' },
    { seed: 10, name: 'Utah State', record: '14-5' },
    { seed: 2, name: 'Alabama', record: '13-6' },
    { seed: 15, name: 'Winthrop', record: '14-6' },
  ],
  west: [
    { seed: 1, name: 'Miami (OH)', record: '20-0' },
    { seed: 16, name: 'UMBC', record: '13-7' },
    { seed: 8, name: 'Kentucky', record: '13-6' },
    { seed: 9, name: 'Tennessee', record: '14-6' },
    { seed: 5, name: 'Saint Mary\'s', record: '17-4' },
    { seed: 12, name: 'Grand Canyon', record: '17-4' },
    { seed: 4, name: 'Wisconsin', record: '15-5' },
    { seed: 13, name: 'S Dakota St', record: '16-6' },
    { seed: 6, name: 'Villanova', record: '14-6' },
    { seed: 11, name: 'VCU', record: '15-5' },
    { seed: 3, name: 'UCLA', record: '15-5' },
    { seed: 14, name: 'Yale', record: '14-4' },
    { seed: 7, name: 'Maryland', record: '14-6' },
    { seed: 10, name: 'Colorado', record: '15-5' },
    { seed: 2, name: 'Oregon', record: '16-4' },
    { seed: 15, name: 'N Kentucky', record: '15-5' },
  ],
}

function buildInitialMatchups(): Matchup[] {
  const matchups: Matchup[] = []
  const regions = ['south', 'east', 'midwest', 'west'] as const
  
  regions.forEach((region) => {
    const teams = REGIONS[region]
    for (let i = 0; i < 8; i++) {
      matchups.push({
        id: `r64-${region}-${i}`,
        team1: teams[i * 2],
        team2: teams[i * 2 + 1],
        winner: null,
        round: 0,
        region,
      })
    }
  })

  regions.forEach((region) => {
    for (let i = 0; i < 4; i++) {
      matchups.push({
        id: `r32-${region}-${i}`,
        team1: null,
        team2: null,
        winner: null,
        round: 1,
        region,
      })
    }
  })

  regions.forEach((region) => {
    for (let i = 0; i < 2; i++) {
      matchups.push({
        id: `s16-${region}-${i}`,
        team1: null,
        team2: null,
        winner: null,
        round: 2,
        region,
      })
    }
  })

  regions.forEach((region) => {
    matchups.push({
      id: `e8-${region}`,
      team1: null,
      team2: null,
      winner: null,
      round: 3,
      region,
    })
  })

  matchups.push({
    id: 'f4-1',
    team1: null,
    team2: null,
    winner: null,
    round: 4,
    region: 'south-east',
  })
  matchups.push({
    id: 'f4-2',
    team1: null,
    team2: null,
    winner: null,
    round: 4,
    region: 'midwest-west',
  })

  matchups.push({
    id: 'championship',
    team1: null,
    team2: null,
    winner: null,
    round: 5,
  })

  return matchups
}

// Compact team slot for bracket view
function BracketTeamSlot({ 
  team, 
  isWinner, 
  onClick,
  isClickable,
}: { 
  team: Team | null
  isWinner: boolean
  onClick?: () => void
  isClickable: boolean
}) {
  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        background: isWinner 
          ? `linear-gradient(135deg, ${VOODOO_COLORS.lime}25, ${VOODOO_COLORS.lime}10)`
          : VOODOO_COLORS.darkGray,
        border: `1px solid ${isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.charcoal}`,
        borderRadius: '4px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        boxShadow: isWinner ? `0 0 8px ${VOODOO_COLORS.limeGlow}` : 'none',
        height: '28px',
        minWidth: '140px',
        maxWidth: '160px',
      }}
      onMouseEnter={(e) => {
        if (isClickable && !isWinner) {
          e.currentTarget.style.borderColor = VOODOO_COLORS.orange
          e.currentTarget.style.background = VOODOO_COLORS.charcoal
        }
      }}
      onMouseLeave={(e) => {
        if (!isWinner) {
          e.currentTarget.style.borderColor = VOODOO_COLORS.charcoal
          e.currentTarget.style.background = VOODOO_COLORS.darkGray
        }
      }}
    >
      {team ? (
        <>
          <span style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: VOODOO_COLORS.purple,
            minWidth: '14px',
          }}>
            {team.seed}
          </span>
          <span style={{
            color: isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.white,
            fontWeight: isWinner ? 'bold' : 'normal',
            fontSize: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {team.name}
          </span>
        </>
      ) : (
        <span style={{ color: VOODOO_COLORS.gray, fontSize: '15px' }}>TBD</span>
      )}
    </div>
  )
}

// Bracket matchup (two teams stacked)
function BracketMatchup({ 
  matchup, 
  onSelectWinner,
}: { 
  matchup: Matchup
  onSelectWinner: (team: Team) => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    }}>
      <BracketTeamSlot 
        team={matchup.team1} 
        isWinner={matchup.winner?.name === matchup.team1?.name}
        onClick={() => matchup.team1 && onSelectWinner(matchup.team1)}
        isClickable={!!matchup.team1 && !!matchup.team2}
      />
      <BracketTeamSlot 
        team={matchup.team2} 
        isWinner={matchup.winner?.name === matchup.team2?.name}
        onClick={() => matchup.team2 && onSelectWinner(matchup.team2)}
        isClickable={!!matchup.team1 && !!matchup.team2}
      />
    </div>
  )
}

// Connector lines between rounds
function BracketConnector({ matchCount, direction }: { matchCount: number, direction: 'right' | 'left' }) {
  const height = matchCount * 58
  const paths = []
  
  for (let i = 0; i < matchCount / 2; i++) {
    const y1 = (i * 2) * 58 + 29
    const y2 = (i * 2 + 1) * 58 + 29
    const midY = (y1 + y2) / 2
    
    if (direction === 'right') {
      paths.push(
        <path
          key={i}
          d={`M 0 ${y1} H 15 V ${midY} H 30 M 0 ${y2} H 15 V ${midY}`}
          fill="none"
          stroke={VOODOO_COLORS.lime}
          strokeWidth="1"
          opacity="0.5"
        />
      )
    } else {
      paths.push(
        <path
          key={i}
          d={`M 30 ${y1} H 15 V ${midY} H 0 M 30 ${y2} H 15 V ${midY}`}
          fill="none"
          stroke={VOODOO_COLORS.lime}
          strokeWidth="1"
          opacity="0.5"
        />
      )
    }
  }
  
  return (
    <svg width="30" height={height} style={{ flexShrink: 0 }}>
      {paths}
    </svg>
  )
}

// Region bracket (one side)
function RegionBracket({ 
  regionName,
  matchups,
  onSelectWinner,
  direction,
}: { 
  regionName: string
  matchups: Matchup[]
  onSelectWinner: (id: string, team: Team) => void
  direction: 'left' | 'right'
}) {
  const r64 = matchups.filter(m => m.round === 0)
  const r32 = matchups.filter(m => m.round === 1)
  const s16 = matchups.filter(m => m.round === 2)
  const e8 = matchups.filter(m => m.round === 3)

  const renderRound = (games: Matchup[], spacing: number) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      gap: `${spacing}px`,
      height: '100%',
    }}>
      {games.map(m => (
        <BracketMatchup
          key={m.id}
          matchup={m}
          onSelectWinner={(team) => onSelectWinner(m.id, team)}
        />
      ))}
    </div>
  )

  const content = direction === 'left' ? (
    <>
      {renderRound(r64, 4)}
      <BracketConnector matchCount={8} direction="right" />
      {renderRound(r32, 62)}
      <BracketConnector matchCount={4} direction="right" />
      {renderRound(s16, 178)}
      <BracketConnector matchCount={2} direction="right" />
      {renderRound(e8, 410)}
    </>
  ) : (
    <>
      {renderRound(e8, 410)}
      <BracketConnector matchCount={2} direction="left" />
      {renderRound(s16, 178)}
      <BracketConnector matchCount={4} direction="left" />
      {renderRound(r32, 62)}
      <BracketConnector matchCount={8} direction="left" />
      {renderRound(r64, 4)}
    </>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        textAlign: 'center',
        padding: '4px 12px',
        background: VOODOO_COLORS.purple + '40',
        borderRadius: '4px',
        marginBottom: '8px',
      }}>
        <span style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: VOODOO_COLORS.lime,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {regionName}
        </span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        height: '464px',
      }}>
        {content}
      </div>
    </div>
  )
}

// Final Four bracket (center)
function FinalFourBracket({ 
  matchups,
  onSelectWinner,
}: { 
  matchups: Matchup[]
  onSelectWinner: (id: string, team: Team) => void
}) {
  const f4_1 = matchups.find(m => m.id === 'f4-1')!
  const f4_2 = matchups.find(m => m.id === 'f4-2')!
  const championship = matchups.find(m => m.id === 'championship')!

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '0 16px',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '6px 16px',
        background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}30, ${VOODOO_COLORS.purple}30)`,
        borderRadius: '6px',
        marginBottom: '4px',
      }}>
        <span style={{
          fontSize: '15px',
          fontWeight: 'bold',
          color: VOODOO_COLORS.lime,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Final Four
        </span>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        {/* F4 Game 1 */}
        <BracketMatchup
          matchup={f4_1}
          onSelectWinner={(team) => onSelectWinner('f4-1', team)}
        />
        
        {/* Championship */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{
            fontSize: '15px',
            color: VOODOO_COLORS.orange,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            🏆 Championship
          </span>
          <BracketMatchup
            matchup={championship}
            onSelectWinner={(team) => onSelectWinner('championship', team)}
          />
        </div>
        
        {/* F4 Game 2 */}
        <BracketMatchup
          matchup={f4_2}
          onSelectWinner={(team) => onSelectWinner('f4-2', team)}
        />
      </div>
    </div>
  )
}

// Mobile components
function MobileTeamSlot({ 
  team, 
  isWinner, 
  onClick,
  isClickable,
}: { 
  team: Team | null
  isWinner: boolean
  onClick?: () => void
  isClickable: boolean
}) {
  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        background: isWinner 
          ? `linear-gradient(135deg, ${VOODOO_COLORS.lime}20, ${VOODOO_COLORS.lime}10)`
          : VOODOO_COLORS.darkGray,
        border: `2px solid ${isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.charcoal}`,
        borderRadius: '6px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: isWinner ? `0 0 15px ${VOODOO_COLORS.limeGlow}` : 'none',
        touchAction: 'manipulation',
      }}
      onMouseEnter={(e) => {
        if (isClickable && !isWinner) {
          e.currentTarget.style.borderColor = VOODOO_COLORS.orange
        }
      }}
      onMouseLeave={(e) => {
        if (!isWinner) {
          e.currentTarget.style.borderColor = VOODOO_COLORS.charcoal
        }
      }}
    >
      {team ? (
        <>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '28px',
            background: VOODOO_COLORS.purple,
            borderRadius: '50%',
            fontSize: '15px',
            fontWeight: 'bold',
            color: VOODOO_COLORS.white,
            flexShrink: 0,
          }}>
            {team.seed}
          </span>
          <span style={{
            color: isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.white,
            fontWeight: isWinner ? 'bold' : 'normal',
            fontSize: '15px',
            textTransform: 'uppercase',
          }}>
            {team.name}
          </span>
          {isWinner && <span style={{ marginLeft: 'auto' }}>💀</span>}
        </>
      ) : (
        <span style={{ color: VOODOO_COLORS.gray, fontSize: '16px' }}>TBD</span>
      )}
    </div>
  )
}

function MobileMatchupCard({ 
  matchup, 
  onSelectWinner,
}: { 
  matchup: Matchup
  onSelectWinner: (team: Team) => void
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      width: '100%',
      maxWidth: '280px',
    }}>
      <MobileTeamSlot 
        team={matchup.team1} 
        isWinner={matchup.winner?.name === matchup.team1?.name}
        onClick={() => matchup.team1 && onSelectWinner(matchup.team1)}
        isClickable={!!matchup.team1 && !!matchup.team2}
      />
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, ${VOODOO_COLORS.lime}, ${VOODOO_COLORS.purple})`,
        borderRadius: '1px',
      }} />
      <MobileTeamSlot 
        team={matchup.team2} 
        isWinner={matchup.winner?.name === matchup.team2?.name}
        onClick={() => matchup.team2 && onSelectWinner(matchup.team2)}
        isClickable={!!matchup.team1 && !!matchup.team2}
      />
    </div>
  )
}

function RoundIndicator({ 
  rounds, 
  currentRound, 
  onSelectRound 
}: { 
  rounds: string[]
  currentRound: number
  onSelectRound: (index: number) => void
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '6px',
      padding: '12px 8px',
      flexWrap: 'wrap',
    }}>
      {rounds.slice(0, -1).map((round, index) => (
        <button
          key={round}
          onClick={() => onSelectRound(index)}
          style={{
            padding: '6px 10px',
            background: currentRound === index 
              ? VOODOO_COLORS.lime 
              : VOODOO_COLORS.charcoal,
            color: currentRound === index 
              ? VOODOO_COLORS.black 
              : VOODOO_COLORS.white,
            border: 'none',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {round}
        </button>
      ))}
    </div>
  )
}

function SwipeContainer({ 
  children, 
  currentIndex, 
  totalSlides,
  onSwipe 
}: { 
  children: React.ReactNode[]
  currentIndex: number
  totalSlides: number
  onSwipe: (direction: 'left' | 'right') => void
}) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)
    if (touchStart) {
      setDragOffset(currentTouch - touchStart)
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setDragOffset(0)
      return
    }
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe && currentIndex < totalSlides - 1) {
      onSwipe('left')
    } else if (isRightSwipe && currentIndex > 0) {
      onSwipe('right')
    }
    
    setDragOffset(0)
    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div 
      style={{
        overflow: 'hidden',
        width: '100%',
        touchAction: 'pan-y pinch-zoom',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div style={{
        display: 'flex',
        transition: dragOffset === 0 ? 'transform 0.3s ease-out' : 'none',
        transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
      }}>
        {children.map((child, index) => (
          <div key={index} style={{ minWidth: '100%', padding: '0 12px', boxSizing: 'border-box' }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

function RegionLabel({ name }: { name: string }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '6px 12px',
      background: VOODOO_COLORS.purple + '40',
      borderRadius: '6px',
      marginBottom: '10px',
    }}>
      <span style={{
        fontSize: '15px',
        fontWeight: 'bold',
        color: VOODOO_COLORS.lime,
        textTransform: 'uppercase',
      }}>
        {name} Region
      </span>
    </div>
  )
}

export default function VoodooBracket() {
  const [matchups, setMatchups] = useState<Matchup[]>(buildInitialMatchups)
  const [currentRound, setCurrentRound] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1200)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSelectWinner = (matchupId: string, winner: Team) => {
    setMatchups(prev => {
      const updated = [...prev]
      const matchupIndex = updated.findIndex(m => m.id === matchupId)
      if (matchupIndex === -1) return prev

      updated[matchupIndex] = { ...updated[matchupIndex], winner }

      // Advance logic
      if (matchupId.startsWith('r64-')) {
        const parts = matchupId.split('-')
        const region = parts[1]
        const gameNum = parseInt(parts[2])
        const r32Index = updated.findIndex(m => m.id === `r32-${region}-${Math.floor(gameNum / 2)}`)
        if (r32Index !== -1) {
          if (gameNum % 2 === 0) updated[r32Index] = { ...updated[r32Index], team1: winner }
          else updated[r32Index] = { ...updated[r32Index], team2: winner }
        }
      }

      if (matchupId.startsWith('r32-')) {
        const parts = matchupId.split('-')
        const region = parts[1]
        const gameNum = parseInt(parts[2])
        const s16Index = updated.findIndex(m => m.id === `s16-${region}-${Math.floor(gameNum / 2)}`)
        if (s16Index !== -1) {
          if (gameNum % 2 === 0) updated[s16Index] = { ...updated[s16Index], team1: winner }
          else updated[s16Index] = { ...updated[s16Index], team2: winner }
        }
      }

      if (matchupId.startsWith('s16-')) {
        const parts = matchupId.split('-')
        const region = parts[1]
        const gameNum = parseInt(parts[2])
        const e8Index = updated.findIndex(m => m.id === `e8-${region}`)
        if (e8Index !== -1) {
          if (gameNum === 0) updated[e8Index] = { ...updated[e8Index], team1: winner }
          else updated[e8Index] = { ...updated[e8Index], team2: winner }
        }
      }

      if (matchupId.startsWith('e8-')) {
        const region = matchupId.replace('e8-', '')
        if (region === 'south' || region === 'east') {
          const f4Index = updated.findIndex(m => m.id === 'f4-1')
          if (f4Index !== -1) {
            if (region === 'south') updated[f4Index] = { ...updated[f4Index], team1: winner }
            else updated[f4Index] = { ...updated[f4Index], team2: winner }
          }
        } else {
          const f4Index = updated.findIndex(m => m.id === 'f4-2')
          if (f4Index !== -1) {
            if (region === 'midwest') updated[f4Index] = { ...updated[f4Index], team1: winner }
            else updated[f4Index] = { ...updated[f4Index], team2: winner }
          }
        }
      }

      if (matchupId.startsWith('f4-')) {
        const champIndex = updated.findIndex(m => m.id === 'championship')
        if (champIndex !== -1) {
          if (matchupId === 'f4-1') updated[champIndex] = { ...updated[champIndex], team1: winner }
          else updated[champIndex] = { ...updated[champIndex], team2: winner }
        }
      }

      return updated
    })
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentRound < 5) setCurrentRound(prev => prev + 1)
    else if (direction === 'right' && currentRound > 0) setCurrentRound(prev => prev - 1)
  }

  const champion = matchups.find(m => m.id === 'championship')?.winner
  const getMatchupsByRegion = (region: string) => matchups.filter(m => m.region === region)
  const getMatchupsByRound = (round: number) => matchups.filter(m => m.round === round)

  // Mobile round views
  const mobileRoundViews = ROUNDS.slice(0, -1).map((roundName, roundIndex) => {
    const roundMatchups = getMatchupsByRound(roundIndex)
    
    if (roundIndex <= 3) {
      return (
        <div key={roundName} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
          {['south', 'east', 'midwest', 'west'].map(region => {
            const regionMatchups = roundMatchups.filter(m => m.region === region)
            if (regionMatchups.length === 0) return null
            return (
              <div key={region}>
                <RegionLabel name={region.charAt(0).toUpperCase() + region.slice(1)} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                  {regionMatchups.map(matchup => (
                    <MobileMatchupCard 
                      key={matchup.id}
                      matchup={matchup}
                      onSelectWinner={(team) => handleSelectWinner(matchup.id, team)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )
    } else {
      return (
        <div key={roundName} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', paddingBottom: '20px' }}>
          <div style={{
            textAlign: 'center',
            padding: '10px 20px',
            background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}30, ${VOODOO_COLORS.purple}30)`,
            borderRadius: '10px',
          }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: VOODOO_COLORS.lime, textTransform: 'uppercase' }}>
              {roundName}
            </span>
          </div>
          {roundMatchups.map(matchup => (
            <MobileMatchupCard 
              key={matchup.id}
              matchup={matchup}
              onSelectWinner={(team) => handleSelectWinner(matchup.id, team)}
            />
          ))}
        </div>
      )
    }
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${VOODOO_COLORS.black} 0%, #0A0A0A 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: VOODOO_COLORS.white,
      padding: '12px 0',
      overflowX: 'hidden',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px', padding: '0 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '24px' }}>💀</span>
          <h1 style={{
            fontSize: 'clamp(18px, 4vw, 32px)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: 0,
            background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}, ${VOODOO_COLORS.orange})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Voodoo Bracket
          </h1>
          <span style={{ fontSize: '24px' }}>💀</span>
        </div>
        <p style={{ color: VOODOO_COLORS.gray, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
          March Madness 2026 • 64 Teams
        </p>
      </div>

      {/* Champion Display */}
      {champion && (
        <div style={{
          textAlign: 'center',
          padding: '14px',
          margin: '0 16px 12px',
          background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}20, ${VOODOO_COLORS.purple}20)`,
          borderRadius: '10px',
          border: `2px solid ${VOODOO_COLORS.lime}`,
          boxShadow: `0 0 25px ${VOODOO_COLORS.limeGlow}`,
        }}>
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>🏆</div>
          <div style={{ fontSize: '15px', color: VOODOO_COLORS.orange, textTransform: 'uppercase', letterSpacing: '2px' }}>
            National Champion
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: VOODOO_COLORS.lime, textTransform: 'uppercase' }}>
            {champion.name}
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ textAlign: 'center', marginBottom: '8px', color: VOODOO_COLORS.gray, fontSize: '16px' }}>
        {matchups.filter(m => m.winner).length} / {matchups.length} picks made
      </div>

      {isMobile ? (
        <>
          <RoundIndicator rounds={ROUNDS} currentRound={currentRound} onSelectRound={setCurrentRound} />
          <div style={{ textAlign: 'center', color: VOODOO_COLORS.gray, fontSize: '15px', marginBottom: '10px' }}>
            👈 Swipe or tap rounds 👉
          </div>
          <SwipeContainer currentIndex={currentRound} totalSlides={6} onSwipe={handleSwipe}>
            {mobileRoundViews}
          </SwipeContainer>
        </>
      ) : (
        /* Desktop Bracket View */
        <div style={{ 
          overflowX: 'auto', 
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '8px', 
            minWidth: 'max-content',
          }}>
            {/* Left Side - South & East */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <RegionBracket
                regionName="South"
                matchups={getMatchupsByRegion('south')}
                onSelectWinner={handleSelectWinner}
                direction="left"
              />
              <RegionBracket
                regionName="East"
                matchups={getMatchupsByRegion('east')}
                onSelectWinner={handleSelectWinner}
                direction="left"
              />
            </div>

            {/* Center - Final Four */}
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '960px' }}>
              <FinalFourBracket matchups={matchups} onSelectWinner={handleSelectWinner} />
            </div>

            {/* Right Side - Midwest & West */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <RegionBracket
                regionName="Midwest"
                matchups={getMatchupsByRegion('midwest')}
                onSelectWinner={handleSelectWinner}
                direction="right"
              />
              <RegionBracket
                regionName="West"
                matchups={getMatchupsByRegion('west')}
                onSelectWinner={handleSelectWinner}
                direction="right"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', color: VOODOO_COLORS.gray, fontSize: '15px' }}>
        <p style={{ margin: '0 0 4px' }}>Tap a team to pick them as the winner</p>
        <p style={{ margin: 0, color: VOODOO_COLORS.orange, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Proof of Concept • Consume & Create
        </p>
      </div>

      <div style={{ position: 'fixed', top: '12px', left: '12px', fontSize: '16px', opacity: 0.1, pointerEvents: 'none' }}>💀</div>
      <div style={{ position: 'fixed', bottom: '12px', right: '12px', fontSize: '16px', opacity: 0.1, pointerEvents: 'none' }}>💀</div>
    </div>
  )
}
