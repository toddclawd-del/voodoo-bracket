import { useState, useRef, useEffect } from 'react'

// Voodoo Ranger-inspired March Madness Bracket
// Colors: Dark base, neon lime green, orange, purple accents
// Vibe: Bold, edgy, "Live Rangerously"

interface Team {
  seed: number
  name: string
}

interface Matchup {
  id: string
  team1: Team | null
  team2: Team | null
  winner: Team | null
  round: number
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

const ROUNDS = ['Round 1', 'Semifinals', 'Championship', 'Champion']

// Sample teams for demo
const SAMPLE_TEAMS: Team[] = [
  { seed: 1, name: 'Hop Devils' },
  { seed: 8, name: 'Malt Zombies' },
  { seed: 4, name: 'Citrus Reapers' },
  { seed: 5, name: 'Haze Phantoms' },
  { seed: 3, name: 'Bitter Skulls' },
  { seed: 6, name: 'Tropical Hexers' },
  { seed: 2, name: 'Imperial Wraiths' },
  { seed: 7, name: 'Pale Specters' },
]

const initialMatchups: Matchup[] = [
  { id: 'r1-1', team1: SAMPLE_TEAMS[0], team2: SAMPLE_TEAMS[1], winner: null, round: 0 },
  { id: 'r1-2', team1: SAMPLE_TEAMS[2], team2: SAMPLE_TEAMS[3], winner: null, round: 0 },
  { id: 'r1-3', team1: SAMPLE_TEAMS[4], team2: SAMPLE_TEAMS[5], winner: null, round: 0 },
  { id: 'r1-4', team1: SAMPLE_TEAMS[6], team2: SAMPLE_TEAMS[7], winner: null, round: 0 },
  { id: 'r2-1', team1: null, team2: null, winner: null, round: 1 },
  { id: 'r2-2', team1: null, team2: null, winner: null, round: 1 },
  { id: 'final', team1: null, team2: null, winner: null, round: 2 },
]

function TeamSlot({ 
  team, 
  isWinner, 
  onClick,
  isClickable 
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
        gap: '12px',
        padding: '14px 16px',
        background: isWinner 
          ? `linear-gradient(135deg, ${VOODOO_COLORS.lime}20, ${VOODOO_COLORS.lime}10)`
          : VOODOO_COLORS.darkGray,
        border: `2px solid ${isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.charcoal}`,
        borderRadius: '8px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: isWinner ? `0 0 20px ${VOODOO_COLORS.limeGlow}` : 'none',
        touchAction: 'manipulation',
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
            width: '28px',
            height: '28px',
            background: VOODOO_COLORS.purple,
            borderRadius: '50%',
            fontSize: '12px',
            fontWeight: 'bold',
            color: VOODOO_COLORS.white,
            flexShrink: 0,
          }}>
            {team.seed}
          </span>
          <span style={{
            color: isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.white,
            fontWeight: isWinner ? 'bold' : 'normal',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {team.name}
          </span>
          {isWinner && (
            <span style={{ marginLeft: 'auto', fontSize: '16px' }}>💀</span>
          )}
        </>
      ) : (
        <span style={{ color: VOODOO_COLORS.gray, fontStyle: 'italic', fontSize: '14px' }}>
          TBD
        </span>
      )}
    </div>
  )
}

function MatchupCard({ 
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
      <TeamSlot 
        team={matchup.team1} 
        isWinner={matchup.winner?.name === matchup.team1?.name}
        onClick={() => matchup.team1 && onSelectWinner(matchup.team1)}
        isClickable={!!matchup.team1 && !!matchup.team2}
      />
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, ${VOODOO_COLORS.lime}, ${VOODOO_COLORS.purple})`,
        margin: '2px 0',
        borderRadius: '1px',
      }} />
      <TeamSlot 
        team={matchup.team2} 
        isWinner={matchup.winner?.name === matchup.team2?.name}
        onClick={() => matchup.team2 && onSelectWinner(matchup.team2)}
        isClickable={!!matchup.team1 && !!matchup.team2}
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
      gap: '8px',
      padding: '16px',
      flexWrap: 'wrap',
    }}>
      {rounds.slice(0, -1).map((round, index) => (
        <button
          key={round}
          onClick={() => onSelectRound(index)}
          style={{
            padding: '8px 16px',
            background: currentRound === index 
              ? VOODOO_COLORS.lime 
              : VOODOO_COLORS.charcoal,
            color: currentRound === index 
              ? VOODOO_COLORS.black 
              : VOODOO_COLORS.white,
            border: 'none',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
  const containerRef = useRef<HTMLDivElement>(null)
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
      ref={containerRef}
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
              padding: '0 16px',
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

// Desktop bracket connector
function Connector({ height = 60 }: { height?: number }) {
  return (
    <div style={{
      width: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <svg width="40" height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={VOODOO_COLORS.lime} />
            <stop offset="100%" stopColor={VOODOO_COLORS.purple} />
          </linearGradient>
        </defs>
        <path
          d={`M 0 ${height * 0.25} H 20 V ${height * 0.5} H 40`}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
        />
        <path
          d={`M 0 ${height * 0.75} H 20 V ${height * 0.5}`}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

export default function VoodooBracket() {
  const [matchups, setMatchups] = useState<Matchup[]>(initialMatchups)
  const [currentRound, setCurrentRound] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
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

      updated[matchupIndex] = { ...updated[matchupIndex], winner }

      // Advance winner to next round
      if (matchupId === 'r1-1') {
        updated[4] = { ...updated[4], team1: winner }
      } else if (matchupId === 'r1-2') {
        updated[4] = { ...updated[4], team2: winner }
      } else if (matchupId === 'r1-3') {
        updated[5] = { ...updated[5], team1: winner }
      } else if (matchupId === 'r1-4') {
        updated[5] = { ...updated[5], team2: winner }
      } else if (matchupId === 'r2-1') {
        updated[6] = { ...updated[6], team1: winner }
      } else if (matchupId === 'r2-2') {
        updated[6] = { ...updated[6], team2: winner }
      }

      return updated
    })
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentRound < 2) {
      setCurrentRound(prev => prev + 1)
    } else if (direction === 'right' && currentRound > 0) {
      setCurrentRound(prev => prev - 1)
    }
  }

  const champion = matchups[6].winner

  const round1Matchups = matchups.filter(m => m.round === 0)
  const round2Matchups = matchups.filter(m => m.round === 1)
  const finalMatchup = matchups.find(m => m.round === 2)!

  // Mobile round views
  const mobileRoundViews = [
    // Round 1
    <div key="r1" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      alignItems: 'center',
      paddingBottom: '20px',
    }}>
      {round1Matchups.map(matchup => (
        <MatchupCard 
          key={matchup.id}
          matchup={matchup}
          onSelectWinner={(team) => handleSelectWinner(matchup.id, team)}
        />
      ))}
    </div>,
    // Semifinals
    <div key="r2" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      alignItems: 'center',
      paddingBottom: '20px',
    }}>
      {round2Matchups.map(matchup => (
        <MatchupCard 
          key={matchup.id}
          matchup={matchup}
          onSelectWinner={(team) => handleSelectWinner(matchup.id, team)}
        />
      ))}
    </div>,
    // Championship
    <div key="final" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      alignItems: 'center',
      paddingBottom: '20px',
    }}>
      <MatchupCard 
        matchup={finalMatchup}
        onSelectWinner={(team) => handleSelectWinner(finalMatchup.id, team)}
      />
    </div>,
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${VOODOO_COLORS.black} 0%, #0A0A0A 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: VOODOO_COLORS.white,
      padding: '20px 0',
      overflowX: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '0 20px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '32px' }}>💀</span>
          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 48px)',
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
          <span style={{ fontSize: '32px' }}>💀</span>
        </div>
        <p style={{
          color: VOODOO_COLORS.gray,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: 0,
        }}>
          March Madness 2026 • Live Rangerously
        </p>
      </div>

      {/* Champion Display */}
      {champion && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          padding: '20px',
          margin: '0 20px 20px',
          background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}20, ${VOODOO_COLORS.purple}20)`,
          borderRadius: '16px',
          border: `2px solid ${VOODOO_COLORS.lime}`,
          boxShadow: `0 0 40px ${VOODOO_COLORS.limeGlow}`,
        }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
          <div style={{
            fontSize: '11px',
            color: VOODOO_COLORS.orange,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '4px',
          }}>
            Champion
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: VOODOO_COLORS.lime,
            textTransform: 'uppercase',
          }}>
            {champion.name}
          </div>
        </div>
      )}

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
            fontSize: '11px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <span>👈</span>
            <span>Swipe to navigate rounds</span>
            <span>👉</span>
          </div>

          <SwipeContainer
            currentIndex={currentRound}
            totalSlides={3}
            onSwipe={handleSwipe}
          >
            {mobileRoundViews}
          </SwipeContainer>
        </>
      ) : (
        /* Desktop Layout */
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          overflowX: 'auto',
          padding: '20px',
        }}>
          {/* Round 1 - Left */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '-20px' }}>
              <span style={{
                fontSize: '10px',
                color: VOODOO_COLORS.orange,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Round 1
              </span>
            </div>
            {round1Matchups.slice(0, 2).map(matchup => (
              <MatchupCard 
                key={matchup.id}
                matchup={matchup}
                onSelectWinner={(team) => handleSelectWinner(matchup.id, team)}
              />
            ))}
          </div>

          <Connector height={200} />

          {/* Semifinals - Left */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '120px',
            paddingTop: '60px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '-40px', marginTop: '-40px' }}>
              <span style={{
                fontSize: '10px',
                color: VOODOO_COLORS.orange,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Semifinal
              </span>
            </div>
            <MatchupCard 
              matchup={round2Matchups[0]}
              onSelectWinner={(team) => handleSelectWinner('r2-1', team)}
            />
          </div>

          <Connector height={100} />

          {/* Championship */}
          <div style={{ paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span style={{
                fontSize: '10px',
                color: VOODOO_COLORS.lime,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                🏆 Championship
              </span>
            </div>
            <MatchupCard 
              matchup={finalMatchup}
              onSelectWinner={(team) => handleSelectWinner('final', team)}
            />
          </div>

          <Connector height={100} />

          {/* Semifinals - Right */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '120px',
            paddingTop: '60px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '-40px', marginTop: '-40px' }}>
              <span style={{
                fontSize: '10px',
                color: VOODOO_COLORS.orange,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Semifinal
              </span>
            </div>
            <MatchupCard 
              matchup={round2Matchups[1]}
              onSelectWinner={(team) => handleSelectWinner('r2-2', team)}
            />
          </div>

          <Connector height={200} />

          {/* Round 1 - Right */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '-20px' }}>
              <span style={{
                fontSize: '10px',
                color: VOODOO_COLORS.orange,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Round 1
              </span>
            </div>
            {round1Matchups.slice(2, 4).map(matchup => (
              <MatchupCard 
                key={matchup.id}
                matchup={matchup}
                onSelectWinner={(team) => handleSelectWinner(matchup.id, team)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        color: VOODOO_COLORS.gray,
        fontSize: '13px',
      }}>
        <p style={{ margin: '0 0 8px' }}>
          Tap a team to pick them as the winner
        </p>
        <p style={{ 
          margin: 0, 
          color: VOODOO_COLORS.orange,
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Proof of Concept • Consume & Create
        </p>
      </div>

      {/* Floating skull decorations */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        fontSize: '20px',
        opacity: 0.15,
        pointerEvents: 'none',
      }}>💀</div>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        fontSize: '20px',
        opacity: 0.15,
        pointerEvents: 'none',
      }}>💀</div>
    </div>
  )
}
