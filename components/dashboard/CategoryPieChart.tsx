'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CATEGORY_COLORS, type Category } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
  category: Category
  total: number
}

interface CategoryPieChartProps {
  data: CategoryData[]
  title: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-xl border border-border/60 bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl shadow-black/10 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: d.payload.fill ?? d.fill }}
        />
        <span className="font-semibold text-foreground">{d.name}</span>
      </div>
      <p className="text-muted-foreground text-xs">
        {formatCurrency(Number(d.value))}
      </p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (!percent || percent < 0.06) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function CategoryPieChart({ data, title }: CategoryPieChartProps) {
  const totalValue = data.reduce((acc, d) => acc + d.total, 0)

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <p className="text-sm font-semibold text-foreground mb-5">{title}</p>
        <div className="flex items-center justify-center h-48 text-muted-foreground/60 text-sm flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <p>Nenhuma transação no período</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="text-xs text-muted-foreground/60 bg-muted/50 rounded-lg px-2.5 py-1 font-medium">
          {data.length} {data.length === 1 ? 'categoria' : 'categorias'}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={95}
            innerRadius={36}
            dataKey="total"
            nameKey="category"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category]}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-col gap-2">
        {data.slice(0, 5).map((entry) => {
          const pct = totalValue > 0 ? (entry.total / totalValue) * 100 : 0
          return (
            <div key={entry.category} className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
              />
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="text-xs text-muted-foreground truncate">{entry.category}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-foreground">{formatCurrency(entry.total)}</span>
                  <span className="text-[10px] text-muted-foreground/60 w-7 text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )
        })}
        {data.length > 5 && (
          <p className="text-xs text-muted-foreground/50 text-center mt-1">
            +{data.length - 5} outras categorias
          </p>
        )}
      </div>
    </div>
  )
}
