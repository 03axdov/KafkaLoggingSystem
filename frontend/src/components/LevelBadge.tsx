type LevelBadgeProps = {
  level: string
}

function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span className={`level-badge level-${level.toLowerCase()}`}>{level}</span>
  )
}

export default LevelBadge
