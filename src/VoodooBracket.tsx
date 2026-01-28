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
// Organized by region with proper 1-16 seeding
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
    { seed: 3, name: 'Michigan State', record: '18-2' },
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
    { seed: 4, name: 'North Carolina', record: '16-4' },
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
    { seed: 13, name: 'South Dakota St', record: '16-6' },
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

// Build initial matchups for 64-team bracket
function buildInitialMatchups(): Matchup[] {
  const matchups: Matchup[] = []
  const regions = ['south', 'east', 'midwest', 'west'] as const
  
  // Round of 64 (32 games)
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

  // Round of 32 (16 games)
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

  // Sweet 16 (8 games)
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

  // Elite 8 (4 games)
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

  // Final Four (2 games)
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

  // Championship
  matchups.push({
    id: 'championship',
    team1: null,
    team2: null,
    winner: null,
    round: 5,
  })

  return matchups
}

function TeamSlot({ 
  team, 
  isWinner, 
  onClick,
  isClickable,
  compact = false,
}: { 
  team: Team | null
  isWinner: boolean
  onClick?: () => void
  isClickable: boolean
  compact?: boolean
}) {
  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '8px' : '10px',
        padding: compact ? '8px 10px' : '10px 12px',
        background: isWinner 
          ? `linear-gradient(135deg, ${VOODOO_COLORS.lime}20, ${VOODOO_COLORS.lime}10)`
          : VOODOO_COLORS.darkGray,
        border: `2px solid ${isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.charcoal}`,
        borderRadius: '6px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: isWinner ? `0 0 15px ${VOODOO_COLORS.limeGlow}` : 'none',
        touchAction: 'manipulation',
        minHeight: compact ? '36px' : '42px',
      }}
      onMouseEnter={(e) => {
        if (isClickable && !isWinner) {
          e.currentTarget.style.borderColor = VOODOO_COLORS.orange
          e.currentTarget.style.transform = 'scale(1.02)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isWinner) {
          e.currentTarget.style.borderColor = VOODOO_COLORS.charcoal
          e.currentTarget.style.transform = 'scale(1)'
        }
      }}
    >
      {team ? (
        <>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: compact ? '22px' : '24px',
            height: compact ? '22px' : '24px',
            background: VOODOO_COLORS.purple,
            borderRadius: '50%',
            fontSize: compact ? '10px' : '11px',
            fontWeight: 'bold',
            color: VOODOO_COLORS.white,
            flexShrink: 0,
          }}>
            {team.seed}
          </span>
          <span style={{
            color: isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.white,
            fontWeight: isWinner ? 'bold' : 'normal',
            fontSize: compact ? '11px' : '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {team.name}
          </span>
          {isWinner && (
            <span style={{ marginLeft: 'auto', fontSize: compact ? '12px' : '14px' }}>💀</span>
          )}
        </>
      ) : (
        <span style={{ color: VOODOO_COLORS.gray, fontStyle: 'italic', fontSize: compact ? '10px' : '11px' }}>
          TBD
        </span>
      )}
    </div>
  )
}

function MatchupCard({ 
  matchup, 
  onSelectWinner,
  compact = false,
}: { 
  matchup: Matchup
  onSelectWinner: (team: Team) => void
  compact?: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      width: '100%',
      maxWidth: compact ? '200px' : '240px',
    }}>
      <TeamSlot 
        team={matchup.team1} 
        isWinner={matchup.winner?.name === matchup.team1?.name}
        onClick={() => matchup.team1 && onSelectWinner(matchup.team1)}
        isClickable={!!matchup.team1 && !!matchup.team2}
        compact={compact}
      />
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, ${VOODOO_COLORS.lime}, ${VOODOO_COLORS.purple})`,
        margin: '1px 0',
        borderRadius: '1px',
      }} />
      <TeamSlot 
        team={matchup.team2} 
        isWinner={matchup.winner?.name === matchup.team2?.name}
        onClick={() => matchup.team2 && onSelectWinner(matchup.team2)}
        isClickable={!!matchup.team1 && !!matchup.team2}
        compact={compact}
      />
    </div>
  )
}

// Round indicator pills
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
            padding: '6px 12px',
            background: currentRound === index 
              ? VOODOO_COLORS.lime 
              : VOODOO_COLORS.charcoal,
            color: currentRound === index 
              ? VOODOO_COLORS.black 
              : VOODOO_COLORS.white,
            border: 'none',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {round}
        </button>
      ))}
    </div>
  )
}

// Mobile swipe container
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
          <div
            key={index}
            style={{
              minWidth: '100%',
              padding: '0 12px',
              boxSizing: 'border-box',
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

// Region label component
function RegionLabel({ name }: { name: string }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '8px 16px',
      background: VOODOO_COLORS.purple + '40',
      borderRadius: '8px',
      marginBottom: '12px',
    }}>
      <span style={{
        fontSize: '12px',
        fontWeight: 'bold',
        color: VOODOO_COLORS.lime,
        textTransform: 'uppercase',
        letterSpacing: '1px',
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSelectWinner = (matchupId: string, winner: Team) => {
    setMatchups(prev => {
      const updated = [...prev]
      const matchupIndex = updated.findIndex(m => m.id === matchupId)
      if (matchupIndex === -1) return prev

      const matchup = updated[matchupIndex]
      updated[matchupIndex] = { ...matchup, winner }

      // Round of 64 → Round of 32
      if (matchupId.startsWith('r64-')) {
        const parts = matchupId.split('-')
        const region = parts[1]
        const gameNum = parseInt(parts[2])
        const r32Index = updated.findIndex(m => m.id === `r32-${region}-${Math.floor(gameNum / 2)}`)
        if (r32Index !== -1) {
          if (gameNum % 2 === 0) {
            updated[r32Index] = { ...updated[r32Index], team1: winner }
          } else {
            updated[r32Index] = { ...updated[r32Index], team2: winner }
          }
        }
      }

      // Round of 32 → Sweet 16
      if (matchupId.startsWith('r32-')) {
        const parts = matchupId.split('-')
        const region = parts[1]
        const gameNum = parseInt(parts[2])
        const s16Index = updated.findIndex(m => m.id === `s16-${region}-${Math.floor(gameNum / 2)}`)
        if (s16Index !== -1) {
          if (gameNum % 2 === 0) {
            updated[s16Index] = { ...updated[s16Index], team1: winner }
          } else {
            updated[s16Index] = { ...updated[s16Index], team2: winner }
          }
        }
      }

      // Sweet 16 → Elite 8
      if (matchupId.startsWith('s16-')) {
        const parts = matchupId.split('-')
        const region = parts[1]
        const gameNum = parseInt(parts[2])
        const e8Index = updated.findIndex(m => m.id === `e8-${region}`)
        if (e8Index !== -1) {
          if (gameNum === 0) {
            updated[e8Index] = { ...updated[e8Index], team1: winner }
          } else {
            updated[e8Index] = { ...updated[e8Index], team2: winner }
          }
        }
      }

      // Elite 8 → Final Four
      if (matchupId.startsWith('e8-')) {
        const region = matchupId.replace('e8-', '')
        if (region === 'south' || region === 'east') {
          const f4Index = updated.findIndex(m => m.id === 'f4-1')
          if (f4Index !== -1) {
            if (region === 'south') {
              updated[f4Index] = { ...updated[f4Index], team1: winner }
            } else {
              updated[f4Index] = { ...updated[f4Index], team2: winner }
            }
          }
        } else {
          const f4Index = updated.findIndex(m => m.id === 'f4-2')
          if (f4Index !== -1) {
            if (region === 'midwest') {
              updated[f4Index] = { ...updated[f4Index], team1: winner }
            } else {
              updated[f4Index] = { ...updated[f4Index], team2: winner }
            }
          }
        }
      }

      // Final Four → Championship
      if (matchupId.startsWith('f4-')) {
        const gameNum = matchupId === 'f4-1' ? 0 : 1
        const champIndex = updated.findIndex(m => m.id === 'championship')
        if (champIndex !== -1) {
          if (gameNum === 0) {
            updated[champIndex] = { ...updated[champIndex], team1: winner }
          } else {
            updated[champIndex] = { ...updated[champIndex], team2: winner }
          }
        }
      }

      return updated
    })
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentRound < 5) {
      setCurrentRound(prev => prev + 1)
    } else if (direction === 'right' && currentRound > 0) {
      setCurrentRound(prev => prev - 1)
    }
  }

  const champion = matchups.find(m => m.id === 'championship')?.winner

  // Get matchups by round
  const getMatchupsByRound = (round: number) => matchups.filter(m => m.round === round)
  const getMatchupsByRegion = (round: number, region: string) => 
    matchups.filter(m => m.round === round && m.region === region)

  // Mobile round views
  const mobileRoundViews = ROUNDS.slice(0, -1).map((roundName, roundIndex) => {
    const roundMatchups = getMatchupsByRound(roundIndex)
    
    if (roundIndex <= 3) {
      // Rounds with regions (R64, R32, S16, E8)
      return (
        <div key={roundName} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          paddingBottom: '20px',
        }}>
          {['south', 'east', 'midwest', 'west'].map(region => {
            const regionMatchups = getMatchupsByRegion(roundIndex, region)
            if (regionMatchups.length === 0) return null
            return (
              <div key={region}>
                <RegionLabel name={region.charAt(0).toUpperCase() + region.slice(1)} />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center',
                }}>
                  {regionMatchups.map(matchup => (
                    <MatchupCard 
                      key={matchup.id}
                      matchup={matchup}
                      onSelectWinner={(team) => handleSelectWinner(matchup.id, team)}
                      compact
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )
    } else {
      // Final Four and Championship
      return (
        <div key={roundName} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
          paddingBottom: '20px',
        }}>
          <div style={{
            textAlign: 'center',
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}30, ${VOODOO_COLORS.purple}30)`,
            borderRadius: '12px',
            marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: VOODOO_COLORS.lime,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              {roundName}
            </span>
          </div>
          {roundMatchups.map(matchup => (
            <MatchupCard 
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
      padding: '16px 0',
      overflowX: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '16px',
        padding: '0 16px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '28px' }}>💀</span>
          <h1 style={{
            fontSize: 'clamp(20px, 5vw, 40px)',
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
          <span style={{ fontSize: '28px' }}>💀</span>
        </div>
        <p style={{
          color: VOODOO_COLORS.gray,
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          margin: 0,
        }}>
          March Madness 2026 • 64 Teams • Live Rangerously
        </p>
      </div>

      {/* Champion Display */}
      {champion && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          margin: '0 16px 16px',
          background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}20, ${VOODOO_COLORS.purple}20)`,
          borderRadius: '12px',
          border: `2px solid ${VOODOO_COLORS.lime}`,
          boxShadow: `0 0 30px ${VOODOO_COLORS.limeGlow}`,
        }}>
          <div style={{ fontSize: '36px', marginBottom: '6px' }}>🏆</div>
          <div style={{
            fontSize: '10px',
            color: VOODOO_COLORS.orange,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '4px',
          }}>
            National Champion
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: VOODOO_COLORS.lime,
            textTransform: 'uppercase',
          }}>
            {champion.name}
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div style={{
        textAlign: 'center',
        marginBottom: '8px',
        color: VOODOO_COLORS.gray,
        fontSize: '11px',
      }}>
        {matchups.filter(m => m.winner).length} / {matchups.length} picks made
      </div>

      {/* Mobile Layout */}
      {isMobile ? (
        <>
          <RoundIndicator 
            rounds={ROUNDS}
            currentRound={currentRound}
            onSelectRound={setCurrentRound}
          />
          
          {/* Swipe hint */}
          <div style={{
            textAlign: 'center',
            color: VOODOO_COLORS.gray,
            fontSize: '10px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <span>👈</span>
            <span>Swipe or tap rounds</span>
            <span>👉</span>
          </div>

          <SwipeContainer
            currentIndex={currentRound}
            totalSlides={6}
            onSwipe={handleSwipe}
          >
            {mobileRoundViews}
          </SwipeContainer>
        </>
      ) : (
        /* Desktop Layout - Horizontal scroll */
        <div style={{
          overflowX: 'auto',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            minWidth: 'max-content',
            alignItems: 'flex-start',
          }}>
            {ROUNDS.slice(0, -1).map((roundName, roundIndex) => {
              const roundMatchups = getMatchupsByRound(roundIndex)
              return (
                <div key={roundName} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  minWidth: '220px',
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    background: VOODOO_COLORS.charcoal,
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: VOODOO_COLORS.orange,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {roundName}
                    </span>
                  </div>
                  {roundMatchups.map(matchup => (
                    <MatchupCard 
                      key={matchup.id}
                      matchup={matchup}
                      onSelectWinner={(team) => handleSelectWinner(matchup.id, team)}
                      compact
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        textAlign: 'center',
        marginTop: '32px',
        padding: '16px',
        color: VOODOO_COLORS.gray,
        fontSize: '12px',
      }}>
        <p style={{ margin: '0 0 6px' }}>
          Tap a team to pick them as the winner
        </p>
        <p style={{ 
          margin: 0, 
          color: VOODOO_COLORS.orange,
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Proof of Concept • Consume & Create
        </p>
      </div>

      {/* Floating skulls */}
      <div style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        fontSize: '18px',
        opacity: 0.12,
        pointerEvents: 'none',
      }}>💀</div>
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        fontSize: '18px',
        opacity: 0.12,
        pointerEvents: 'none',
      }}>💀</div>
    </div>
  )
}
