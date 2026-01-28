import { useState, useEffect } from 'react'

// Voodoo Ranger-inspired March Madness Bracket - 64 Teams

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
  black: '#231F20',
  darkGray: '#2D2A2B',
  charcoal: '#3D3A3B',
  gold: '#F1C218',
  goldGlow: '#F1C21880',
  cream: '#EBE9E2',
  darkCream: '#D4D2CB',
  white: '#FFFFFF',
  gray: '#888888',
}

const ROUNDS = ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship', 'Champion']

// Current top 64 teams (January 2026)
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

// Matchup height constants - MUST match actual rendered size
const TEAM_SLOT_HEIGHT = 42 // Height of one team slot
const TEAM_SLOT_GAP = 6 // Gap between the two team slots
const MATCHUP_HEIGHT = TEAM_SLOT_HEIGHT * 2 + TEAM_SLOT_GAP // 90px total
const MATCHUP_GAP = 16 // Gap between matchups in R64

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
      matchups.push({ id: `r32-${region}-${i}`, team1: null, team2: null, winner: null, round: 1, region })
    }
  })

  regions.forEach((region) => {
    for (let i = 0; i < 2; i++) {
      matchups.push({ id: `s16-${region}-${i}`, team1: null, team2: null, winner: null, round: 2, region })
    }
  })

  regions.forEach((region) => {
    matchups.push({ id: `e8-${region}`, team1: null, team2: null, winner: null, round: 3, region })
  })

  matchups.push({ id: 'f4-1', team1: null, team2: null, winner: null, round: 4, region: 'south-east' })
  matchups.push({ id: 'f4-2', team1: null, team2: null, winner: null, round: 4, region: 'midwest-west' })
  matchups.push({ id: 'championship', team1: null, team2: null, winner: null, round: 5 })

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
        gap: '10px',
        padding: '8px 14px',
        background: isWinner 
          ? `linear-gradient(135deg, ${VOODOO_COLORS.gold}25, ${VOODOO_COLORS.gold}10)`
          : VOODOO_COLORS.darkGray,
        border: `2px solid ${isWinner ? VOODOO_COLORS.gold : VOODOO_COLORS.charcoal}`,
        borderRadius: '5px',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        boxShadow: isWinner ? `0 0 10px ${VOODOO_COLORS.goldGlow}` : 'none',
        height: `${TEAM_SLOT_HEIGHT}px`,
        minWidth: '145px',
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => {
        if (isClickable && !isWinner) {
          e.currentTarget.style.borderColor = VOODOO_COLORS.gold
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
            color: VOODOO_COLORS.gold,
            minWidth: '20px',
          }}>
            {team.seed}
          </span>
          <span style={{
            color: isWinner ? VOODOO_COLORS.gold : VOODOO_COLORS.cream,
            fontWeight: isWinner ? 'bold' : 'normal',
            fontSize: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}>
            {team.name}
          </span>
          {isWinner && (
            <img 
              src="/thumbs-up.svg" 
              alt="Winner" 
              style={{ width: '24px', height: '24px', flexShrink: 0 }} 
            />
          )}
        </>
      ) : (
        <span style={{ color: VOODOO_COLORS.gray, fontSize: '14px' }}>TBD</span>
      )}
    </div>
  )
}

// Bracket matchup (two teams stacked)
function BracketMatchup({ matchup, onSelectWinner }: { matchup: Matchup, onSelectWinner: (team: Team) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${TEAM_SLOT_GAP}px`, height: `${MATCHUP_HEIGHT}px` }}>
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

// SVG Connector between rounds - draws lines from pairs of matchups to next round
function RoundConnector({ 
  inputCount, 
  inputSpacing, 
  outputSpacing,
  inputOffset,
  outputOffset,
  direction 
}: { 
  inputCount: number
  inputSpacing: number
  outputSpacing: number
  inputOffset: number
  outputOffset: number
  direction: 'right' | 'left' 
}) {
  const inputCenters: number[] = []
  const outputCenters: number[] = []
  
  // Calculate center Y positions for input matchups (including their offset)
  for (let i = 0; i < inputCount; i++) {
    inputCenters.push(inputOffset + i * inputSpacing + MATCHUP_HEIGHT / 2)
  }
  
  // Calculate center Y positions for output matchups (including their offset)
  for (let i = 0; i < inputCount / 2; i++) {
    outputCenters.push(outputOffset + i * outputSpacing + MATCHUP_HEIGHT / 2)
  }
  
  // Total height needs to cover both input and output ranges
  const inputMax = inputOffset + (inputCount - 1) * inputSpacing + MATCHUP_HEIGHT
  const outputMax = outputOffset + (inputCount / 2 - 1) * outputSpacing + MATCHUP_HEIGHT
  const totalHeight = Math.max(inputMax, outputMax)
  
  const paths = []
  const connectorWidth = 36
  const midX = connectorWidth / 2
  
  for (let i = 0; i < inputCount / 2; i++) {
    const y1 = inputCenters[i * 2]
    const y2 = inputCenters[i * 2 + 1]
    const yOut = outputCenters[i]
    
    if (direction === 'right') {
      // Lines go: horizontal from left edge, then vertical to meet, then horizontal to right edge
      paths.push(
        <path
          key={i}
          d={`M 0 ${y1} H ${midX} V ${yOut} H ${connectorWidth} M 0 ${y2} H ${midX} V ${yOut}`}
          fill="none"
          stroke={VOODOO_COLORS.gold}
          strokeWidth="2"
          opacity="0.6"
        />
      )
    } else {
      paths.push(
        <path
          key={i}
          d={`M ${connectorWidth} ${y1} H ${midX} V ${yOut} H 0 M ${connectorWidth} ${y2} H ${midX} V ${yOut}`}
          fill="none"
          stroke={VOODOO_COLORS.gold}
          strokeWidth="2"
          opacity="0.6"
        />
      )
    }
  }
  
  return (
    <svg width={connectorWidth} height={totalHeight} style={{ flexShrink: 0 }}>
      {paths}
    </svg>
  )
}

// Column of matchups for a round
function RoundColumn({ 
  matchups, 
  spacing, 
  onSelectWinner 
}: { 
  matchups: Matchup[]
  spacing: number
  onSelectWinner: (id: string, team: Team) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing - MATCHUP_HEIGHT}px` }}>
      {matchups.map(m => (
        <BracketMatchup
          key={m.id}
          matchup={m}
          onSelectWinner={(team) => onSelectWinner(m.id, team)}
        />
      ))}
    </div>
  )
}

// Region bracket (one side - 4 rounds)
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

  // Spacing between matchups (center to center)
  const R64_SPACING = MATCHUP_HEIGHT + MATCHUP_GAP
  const R32_SPACING = R64_SPACING * 2
  const S16_SPACING = R32_SPACING * 2
  const E8_SPACING = S16_SPACING * 2

  // Calculate offsets to vertically center each round
  // Each round should be centered between pairs of the previous round
  const R64_OFFSET = 0
  const R32_OFFSET = R64_OFFSET + R64_SPACING / 2
  const S16_OFFSET = R32_OFFSET + R32_SPACING / 2
  const E8_OFFSET = S16_OFFSET + S16_SPACING / 2

  const bracketHeight = 8 * R64_SPACING - MATCHUP_GAP

  const content = direction === 'left' ? (
    <>
      <div style={{ paddingTop: R64_OFFSET }}>
        <RoundColumn matchups={r64} spacing={R64_SPACING} onSelectWinner={onSelectWinner} />
      </div>
      <RoundConnector inputCount={8} inputSpacing={R64_SPACING} outputSpacing={R32_SPACING} inputOffset={R64_OFFSET} outputOffset={R32_OFFSET} direction="right" />
      <div style={{ paddingTop: R32_OFFSET }}>
        <RoundColumn matchups={r32} spacing={R32_SPACING} onSelectWinner={onSelectWinner} />
      </div>
      <RoundConnector inputCount={4} inputSpacing={R32_SPACING} outputSpacing={S16_SPACING} inputOffset={R32_OFFSET} outputOffset={S16_OFFSET} direction="right" />
      <div style={{ paddingTop: S16_OFFSET }}>
        <RoundColumn matchups={s16} spacing={S16_SPACING} onSelectWinner={onSelectWinner} />
      </div>
      <RoundConnector inputCount={2} inputSpacing={S16_SPACING} outputSpacing={E8_SPACING} inputOffset={S16_OFFSET} outputOffset={E8_OFFSET} direction="right" />
      <div style={{ paddingTop: E8_OFFSET }}>
        <RoundColumn matchups={e8} spacing={E8_SPACING} onSelectWinner={onSelectWinner} />
      </div>
    </>
  ) : (
    <>
      <div style={{ paddingTop: E8_OFFSET }}>
        <RoundColumn matchups={e8} spacing={E8_SPACING} onSelectWinner={onSelectWinner} />
      </div>
      <RoundConnector inputCount={2} inputSpacing={S16_SPACING} outputSpacing={E8_SPACING} inputOffset={S16_OFFSET} outputOffset={E8_OFFSET} direction="left" />
      <div style={{ paddingTop: S16_OFFSET }}>
        <RoundColumn matchups={s16} spacing={S16_SPACING} onSelectWinner={onSelectWinner} />
      </div>
      <RoundConnector inputCount={4} inputSpacing={R32_SPACING} outputSpacing={S16_SPACING} inputOffset={R32_OFFSET} outputOffset={S16_OFFSET} direction="left" />
      <div style={{ paddingTop: R32_OFFSET }}>
        <RoundColumn matchups={r32} spacing={R32_SPACING} onSelectWinner={onSelectWinner} />
      </div>
      <RoundConnector inputCount={8} inputSpacing={R64_SPACING} outputSpacing={R32_SPACING} inputOffset={R64_OFFSET} outputOffset={R32_OFFSET} direction="left" />
      <div style={{ paddingTop: R64_OFFSET }}>
        <RoundColumn matchups={r64} spacing={R64_SPACING} onSelectWinner={onSelectWinner} />
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        textAlign: 'center',
        padding: '6px 16px',
        background: VOODOO_COLORS.gold + '30',
        borderRadius: '6px',
        marginBottom: '12px',
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: VOODOO_COLORS.gold,
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          {regionName}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', height: bracketHeight }}>
        {content}
      </div>
    </div>
  )
}

// Final Four bracket (center)
function FinalFourBracket({ matchups, onSelectWinner }: { matchups: Matchup[], onSelectWinner: (id: string, team: Team) => void }) {
  const f4_1 = matchups.find(m => m.id === 'f4-1')!
  const f4_2 = matchups.find(m => m.id === 'f4-2')!
  const championship = matchups.find(m => m.id === 'championship')!

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '0 20px',
      height: '100%',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '8px 20px',
        background: `linear-gradient(135deg, ${VOODOO_COLORS.gold}40, ${VOODOO_COLORS.gold}20)`,
        borderRadius: '8px',
        marginBottom: '16px',
      }}>
        <span style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: VOODOO_COLORS.gold,
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}>
          Final Four
        </span>
      </div>
      
      <BracketMatchup matchup={f4_1} onSelectWinner={(team) => onSelectWinner('f4-1', team)} />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: VOODOO_COLORS.gold, textTransform: 'uppercase', letterSpacing: '1px' }}>
          🏆 Championship
        </span>
        <BracketMatchup matchup={championship} onSelectWinner={(team) => onSelectWinner('championship', team)} />
      </div>
      
      <BracketMatchup matchup={f4_2} onSelectWinner={(team) => onSelectWinner('f4-2', team)} />
    </div>
  )
}

// Mobile components
function MobileTeamSlot({ team, isWinner, onClick, isClickable }: { team: Team | null, isWinner: boolean, onClick?: () => void, isClickable: boolean }) {
  return (
    <div
      onClick={isClickable ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        background: isWinner ? `linear-gradient(135deg, ${VOODOO_COLORS.gold}20, ${VOODOO_COLORS.gold}10)` : VOODOO_COLORS.darkGray,
        border: `2px solid ${isWinner ? VOODOO_COLORS.gold : VOODOO_COLORS.charcoal}`,
        borderRadius: '6px',
        cursor: isClickable ? 'pointer' : 'default',
        boxShadow: isWinner ? `0 0 15px ${VOODOO_COLORS.goldGlow}` : 'none',
        touchAction: 'manipulation',
      }}
    >
      {team ? (
        <>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '26px', height: '26px', background: VOODOO_COLORS.gold,
            borderRadius: '50%', fontSize: '12px', fontWeight: 'bold', color: VOODOO_COLORS.black,
          }}>
            {team.seed}
          </span>
          <span style={{ color: isWinner ? VOODOO_COLORS.gold : VOODOO_COLORS.cream, fontWeight: isWinner ? 'bold' : 'normal', fontSize: '14px', textTransform: 'uppercase' }}>
            {team.name}
          </span>
          {isWinner && <span style={{ marginLeft: 'auto' }}>🏆</span>}
        </>
      ) : (
        <span style={{ color: VOODOO_COLORS.gray, fontSize: '13px' }}>TBD</span>
      )}
    </div>
  )
}

function MobileMatchupCard({ matchup, onSelectWinner }: { matchup: Matchup, onSelectWinner: (team: Team) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', maxWidth: '300px' }}>
      <MobileTeamSlot team={matchup.team1} isWinner={matchup.winner?.name === matchup.team1?.name} onClick={() => matchup.team1 && onSelectWinner(matchup.team1)} isClickable={!!matchup.team1 && !!matchup.team2} />
      <div style={{ height: '2px', background: `linear-gradient(90deg, ${VOODOO_COLORS.gold}, ${VOODOO_COLORS.cream})`, borderRadius: '1px' }} />
      <MobileTeamSlot team={matchup.team2} isWinner={matchup.winner?.name === matchup.team2?.name} onClick={() => matchup.team2 && onSelectWinner(matchup.team2)} isClickable={!!matchup.team1 && !!matchup.team2} />
    </div>
  )
}

function RoundIndicator({ rounds, currentRound, onSelectRound }: { rounds: string[], currentRound: number, onSelectRound: (index: number) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '12px 8px', flexWrap: 'wrap' }}>
      {rounds.slice(0, -1).map((round, index) => (
        <button
          key={round}
          onClick={() => onSelectRound(index)}
          style={{
            padding: '6px 10px',
            background: currentRound === index ? VOODOO_COLORS.gold : VOODOO_COLORS.charcoal,
            color: currentRound === index ? VOODOO_COLORS.black : VOODOO_COLORS.cream,
            border: 'none', borderRadius: '14px', fontSize: '10px', fontWeight: 'bold',
            textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {round}
        </button>
      ))}
    </div>
  )
}

function SwipeContainer({ children, currentIndex, totalSlides, onSwipe }: { children: React.ReactNode[], currentIndex: number, totalSlides: number, onSwipe: (direction: 'left' | 'right') => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX) }
  const onTouchMove = (e: React.TouchEvent) => { const t = e.targetTouches[0].clientX; setTouchEnd(t); if (touchStart) setDragOffset(t - touchStart) }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) { setDragOffset(0); return }
    const d = touchStart - touchEnd
    if (d > 50 && currentIndex < totalSlides - 1) onSwipe('left')
    else if (d < -50 && currentIndex > 0) onSwipe('right')
    setDragOffset(0); setTouchStart(null); setTouchEnd(null)
  }

  return (
    <div style={{ overflow: 'hidden', width: '100%', touchAction: 'pan-y pinch-zoom' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div style={{ display: 'flex', transition: dragOffset === 0 ? 'transform 0.3s ease-out' : 'none', transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))` }}>
        {children.map((child, i) => <div key={i} style={{ minWidth: '100%', padding: '0 12px', boxSizing: 'border-box' }}>{child}</div>)}
      </div>
    </div>
  )
}

function RegionLabel({ name }: { name: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 16px', background: VOODOO_COLORS.gold + '30', borderRadius: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '13px', fontWeight: 'bold', color: VOODOO_COLORS.gold, textTransform: 'uppercase', letterSpacing: '1px' }}>{name} Region</span>
    </div>
  )
}

export default function VoodooBracket() {
  const [matchups, setMatchups] = useState<Matchup[]>(buildInitialMatchups)
  const [currentRound, setCurrentRound] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [bracketScale, setBracketScale] = useState(1)

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 1000)
      // Scale bracket to fit viewport - bracket is ~1650px wide at scale 1
      if (width >= 1700) setBracketScale(1)
      else if (width >= 1500) setBracketScale(0.9)
      else if (width >= 1300) setBracketScale(0.78)
      else if (width >= 1100) setBracketScale(0.66)
      else if (width >= 1000) setBracketScale(0.58)
    }
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  const handleSelectWinner = (matchupId: string, winner: Team) => {
    setMatchups(prev => {
      const updated = [...prev]
      const idx = updated.findIndex(m => m.id === matchupId)
      if (idx === -1) return prev
      updated[idx] = { ...updated[idx], winner }

      if (matchupId.startsWith('r64-')) {
        const [, region, num] = matchupId.split('-')
        const r32Idx = updated.findIndex(m => m.id === `r32-${region}-${Math.floor(parseInt(num) / 2)}`)
        if (r32Idx !== -1) {
          if (parseInt(num) % 2 === 0) updated[r32Idx] = { ...updated[r32Idx], team1: winner }
          else updated[r32Idx] = { ...updated[r32Idx], team2: winner }
        }
      }
      if (matchupId.startsWith('r32-')) {
        const [, region, num] = matchupId.split('-')
        const s16Idx = updated.findIndex(m => m.id === `s16-${region}-${Math.floor(parseInt(num) / 2)}`)
        if (s16Idx !== -1) {
          if (parseInt(num) % 2 === 0) updated[s16Idx] = { ...updated[s16Idx], team1: winner }
          else updated[s16Idx] = { ...updated[s16Idx], team2: winner }
        }
      }
      if (matchupId.startsWith('s16-')) {
        const [, region, num] = matchupId.split('-')
        const e8Idx = updated.findIndex(m => m.id === `e8-${region}`)
        if (e8Idx !== -1) {
          if (parseInt(num) === 0) updated[e8Idx] = { ...updated[e8Idx], team1: winner }
          else updated[e8Idx] = { ...updated[e8Idx], team2: winner }
        }
      }
      if (matchupId.startsWith('e8-')) {
        const region = matchupId.replace('e8-', '')
        if (region === 'south' || region === 'east') {
          const f4Idx = updated.findIndex(m => m.id === 'f4-1')
          if (f4Idx !== -1) {
            if (region === 'south') updated[f4Idx] = { ...updated[f4Idx], team1: winner }
            else updated[f4Idx] = { ...updated[f4Idx], team2: winner }
          }
        } else {
          const f4Idx = updated.findIndex(m => m.id === 'f4-2')
          if (f4Idx !== -1) {
            if (region === 'midwest') updated[f4Idx] = { ...updated[f4Idx], team1: winner }
            else updated[f4Idx] = { ...updated[f4Idx], team2: winner }
          }
        }
      }
      if (matchupId.startsWith('f4-')) {
        const champIdx = updated.findIndex(m => m.id === 'championship')
        if (champIdx !== -1) {
          if (matchupId === 'f4-1') updated[champIdx] = { ...updated[champIdx], team1: winner }
          else updated[champIdx] = { ...updated[champIdx], team2: winner }
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

  const mobileRoundViews = ROUNDS.slice(0, -1).map((roundName, roundIndex) => {
    const roundMatchups = getMatchupsByRound(roundIndex)
    if (roundIndex <= 3) {
      return (
        <div key={roundName} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '20px' }}>
          {['south', 'east', 'midwest', 'west'].map(region => {
            const rm = roundMatchups.filter(m => m.region === region)
            if (rm.length === 0) return null
            return (
              <div key={region}>
                <RegionLabel name={region.charAt(0).toUpperCase() + region.slice(1)} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  {rm.map(matchup => <MobileMatchupCard key={matchup.id} matchup={matchup} onSelectWinner={(team) => handleSelectWinner(matchup.id, team)} />)}
                </div>
              </div>
            )
          })}
        </div>
      )
    } else {
      return (
        <div key={roundName} style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', paddingBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '12px 24px', background: `linear-gradient(135deg, ${VOODOO_COLORS.gold}30, ${VOODOO_COLORS.gold}15)`, borderRadius: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: VOODOO_COLORS.gold, textTransform: 'uppercase' }}>{roundName}</span>
          </div>
          {roundMatchups.map(matchup => <MobileMatchupCard key={matchup.id} matchup={matchup} onSelectWinner={(team) => handleSelectWinner(matchup.id, team)} />)}
        </div>
      )
    }
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${VOODOO_COLORS.black} 0%, #1A1718 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: VOODOO_COLORS.cream,
      padding: '16px 0',
      overflowX: 'hidden',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px', padding: '0 16px' }}>
        <img 
          src="/march-rangerousness.png" 
          alt="March Rangerousness 2026" 
          style={{ 
            maxWidth: 'min(320px, 80vw)', 
            height: 'auto',
            marginBottom: '8px',
          }} 
        />
        <p style={{ color: VOODOO_COLORS.gray, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
          64 Teams • Pick Your Champion
        </p>
      </div>

      {/* Champion */}
      {champion && (
        <div style={{
          textAlign: 'center', padding: '16px', margin: '0 16px 16px',
          background: `linear-gradient(135deg, ${VOODOO_COLORS.gold}25, ${VOODOO_COLORS.gold}10)`,
          borderRadius: '12px', border: `2px solid ${VOODOO_COLORS.gold}`, boxShadow: `0 0 30px ${VOODOO_COLORS.goldGlow}`,
        }}>
          <div style={{ fontSize: '36px', marginBottom: '4px' }}>🏆</div>
          <div style={{ fontSize: '10px', color: VOODOO_COLORS.cream, textTransform: 'uppercase', letterSpacing: '2px' }}>National Champion</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: VOODOO_COLORS.gold, textTransform: 'uppercase' }}>{champion.name}</div>
        </div>
      )}

      {/* Progress */}
      <div style={{ textAlign: 'center', marginBottom: '12px', color: VOODOO_COLORS.gray, fontSize: '11px' }}>
        {matchups.filter(m => m.winner).length} / {matchups.length} picks made
      </div>

      {isMobile ? (
        <>
          <RoundIndicator rounds={ROUNDS} currentRound={currentRound} onSelectRound={setCurrentRound} />
          <div style={{ textAlign: 'center', color: VOODOO_COLORS.gray, fontSize: '10px', marginBottom: '12px' }}>👈 Swipe or tap rounds 👉</div>
          <SwipeContainer currentIndex={currentRound} totalSlides={6} onSwipe={handleSwipe}>{mobileRoundViews}</SwipeContainer>
        </>
      ) : (
        <div style={{ overflow: 'hidden', padding: '20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', transform: `scale(${bracketScale})`, transformOrigin: 'top center' }}>
            {/* Left Side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <RegionBracket regionName="South" matchups={getMatchupsByRegion('south')} onSelectWinner={handleSelectWinner} direction="left" />
              <RegionBracket regionName="East" matchups={getMatchupsByRegion('east')} onSelectWinner={handleSelectWinner} direction="left" />
            </div>
            {/* Center */}
            <FinalFourBracket matchups={matchups} onSelectWinner={handleSelectWinner} />
            {/* Right Side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <RegionBracket regionName="Midwest" matchups={getMatchupsByRegion('midwest')} onSelectWinner={handleSelectWinner} direction="right" />
              <RegionBracket regionName="West" matchups={getMatchupsByRegion('west')} onSelectWinner={handleSelectWinner} direction="right" />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px', color: VOODOO_COLORS.gray, fontSize: '12px' }}>
        <p style={{ margin: '0 0 4px' }}>Tap a team to pick them as the winner</p>
        <p style={{ margin: 0, color: VOODOO_COLORS.cream, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Proof of Concept • Consume & Create</p>
      </div>
    </div>
  )
}
