import { Card, CardContent, Box, Typography } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
  badge?: React.ReactNode;
}

export function KpiCard({ title, value, icon, gradient, subtitle, badge }: KpiCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        background: '#fff',
        border: '1px solid rgba(145,158,171,0.12)',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="body2"
              sx={{ color: '#637381', fontWeight: 500, mb: 0.5, fontSize: '0.82rem' }}
            >
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: '#1a2027', lineHeight: 1.2, fontWeight: 700 }}>
              {value}
              {badge && <Box component="span" sx={{ ml: 1 }}>{badge}</Box>}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: '#1e40af', mt: 0.75, display: 'block', fontWeight: 700, fontSize: '0.92rem' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 6px 16px rgba(0,0,0,0.14)',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
