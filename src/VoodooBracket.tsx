import { useState } from 'react'

// Voodoo Ranger-inspired March Madness Bracket
// Colors: Dark base, neon lime green, orange, purple accents
// Vibe: Bold, edgy, "Live Rangerously"

interface Team {
  seed: number
  name: string
  logo?: string
}

interface Matchup {
  id: string
  team1: Team | null
  team2: Team | null
  winner: Team | null
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
  { id: 'r1-1', team1: SAMPLE_TEAMS[0], team2: SAMPLE_TEAMS[1], winner: null },
  { id: 'r1-2', team1: SAMPLE_TEAMS[2], team2: SAMPLE_TEAMS[3], winner: null },
  { id: 'r1-3', team1: SAMPLE_TEAMS[4], team2: SAMPLE_TEAMS[5], winner: null },
  { id: 'r1-4', team1: SAMPLE_TEAMS[6], team2: SAMPLE_TEAMS[7], winner: null },
  { id: 'r2-1', team1: null, team2: null, winner: null },
  { id: 'r2-2', team1: null, team2: null, winner: null },
  { id: 'final', team1: null, team2: null, winner: null },
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
        padding: '12px 16px',
        background: isWinner 
          ? `linear-gradient(135deg, ${VOODOO_COLORS.lime}20, ${VOODOO_COLORS.lime}10)`
          : VOODOO_COLORS.darkGray,
        border: `2px solid ${isWinner ? VOODOO_COLORS.lime : VOODOO_COLORS.charcoal}`,
        borderRadius: '8px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        minWidth: '200px',
        boxShadow: isWinner ? `0 0 20px ${VOODOO_COLORS.limeGlow}` : 'none',
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
  roundLabel 
}: { 
  matchup: Matchup
  onSelectWinner: (team: Team) => void
  roundLabel: string
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      position: 'relative',
    }}>
      <span style={{
        fontSize: '10px',
        color: VOODOO_COLORS.orange,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '4px',
      }}>
        {roundLabel}
      </span>
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

  const champion = matchups[6].winner

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${VOODOO_COLORS.black} 0%, #0A0A0A 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: VOODOO_COLORS.white,
      padding: '40px 20px',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '40px' }}>💀</span>
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            margin: 0,
            background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}, ${VOODOO_COLORS.orange})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Voodoo Bracket
          </h1>
          <span style={{ fontSize: '40px' }}>💀</span>
        </div>
        <p style={{
          color: VOODOO_COLORS.gray,
          fontSize: '16px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          March Madness 2026 • Live Rangerously
        </p>
      </div>

      {/* Champion Display */}
      {champion && (
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          padding: '24px',
          background: `linear-gradient(135deg, ${VOODOO_COLORS.lime}20, ${VOODOO_COLORS.purple}20)`,
          borderRadius: '16px',
          border: `2px solid ${VOODOO_COLORS.lime}`,
          boxShadow: `0 0 40px ${VOODOO_COLORS.limeGlow}`,
          maxWidth: '400px',
          margin: '0 auto 40px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
          <div style={{
            fontSize: '12px',
            color: VOODOO_COLORS.orange,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '8px',
          }}>
            Champion
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: VOODOO_COLORS.lime,
            textTransform: 'uppercase',
          }}>
            {champion.name}
          </div>
        </div>
      )}

      {/* Bracket */}
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
          <MatchupCard 
            matchup={matchups[0]} 
            onSelectWinner={(team) => handleSelectWinner('r1-1', team)}
            roundLabel="Round 1"
          />
          <MatchupCard 
            matchup={matchups[1]} 
            onSelectWinner={(team) => handleSelectWinner('r1-2', team)}
            roundLabel="Round 1"
          />
        </div>

        <Connector height={200} />

        {/* Round 2 - Left */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '120px',
          paddingTop: '40px',
        }}>
          <MatchupCard 
            matchup={matchups[4]} 
            onSelectWinner={(team) => handleSelectWinner('r2-1', team)}
            roundLabel="Semifinal"
          />
        </div>

        <Connector height={100} />

        {/* Final */}
        <div style={{ paddingTop: '20px' }}>
          <MatchupCard 
            matchup={matchups[6]} 
            onSelectWinner={(team) => handleSelectWinner('final', team)}
            roundLabel="🏆 Championship"
          />
        </div>

        <Connector height={100} />

        {/* Round 2 - Right */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '120px',
          paddingTop: '40px',
        }}>
          <MatchupCard 
            matchup={matchups[5]} 
            onSelectWinner={(team) => handleSelectWinner('r2-2', team)}
            roundLabel="Semifinal"
          />
        </div>

        <Connector height={200} />

        {/* Round 1 - Right */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}>
          <MatchupCard 
            matchup={matchups[2]} 
            onSelectWinner={(team) => handleSelectWinner('r1-3', team)}
            roundLabel="Round 1"
          />
          <MatchupCard 
            matchup={matchups[3]} 
            onSelectWinner={(team) => handleSelectWinner('r1-4', team)}
            roundLabel="Round 1"
          />
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        textAlign: 'center',
        marginTop: '60px',
        padding: '20px',
        color: VOODOO_COLORS.gray,
        fontSize: '14px',
      }}>
        <p style={{ margin: '0 0 8px' }}>
          Click a team to pick them as the winner
        </p>
        <p style={{ 
          margin: 0, 
          color: VOODOO_COLORS.orange,
          fontSize: '12px',
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
        fontSize: '24px',
        opacity: 0.2,
      }}>💀</div>
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        fontSize: '24px',
        opacity: 0.2,
      }}>💀</div>
    </div>
  )
}
