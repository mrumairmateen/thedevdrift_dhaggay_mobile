import React, { memo } from 'react';
import { Badge } from './Badge';
import type { BadgeVariant } from './Badge';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'placed'
  | 'accepted_by_seller'
  | 'ready_to_dispatch_to_tailor'
  | 'dispatching_to_tailor'
  | 'delivered_to_tailor'
  | 'tailor_working'
  | 'ready_for_customer_delivery'
  | 'dispatching_to_customer'
  | 'delivered_to_customer'
  | 'cancelled_by_customer'
  | 'cancelled_by_seller'
  | 'disputed';

export interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

// ─── Status map ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
  placed:                        { variant: 'info',    label: 'Placed'           },
  accepted_by_seller:            { variant: 'info',    label: 'Accepted'         },
  ready_to_dispatch_to_tailor:   { variant: 'warning', label: 'Ready to Dispatch'},
  dispatching_to_tailor:         { variant: 'warning', label: 'Dispatching'      },
  delivered_to_tailor:           { variant: 'warning', label: 'At Tailor'        },
  tailor_working:                { variant: 'warning', label: 'In Progress'      },
  ready_for_customer_delivery:   { variant: 'success', label: 'Ready'            },
  dispatching_to_customer:       { variant: 'success', label: 'Out for Delivery' },
  delivered_to_customer:         { variant: 'success', label: 'Delivered'        },
  cancelled_by_customer:         { variant: 'error',   label: 'Cancelled'        },
  cancelled_by_seller:           { variant: 'error',   label: 'Cancelled'        },
  disputed:                      { variant: 'error',   label: 'Disputed'         },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const StatusBadge = memo(function StatusBadge({
  status,
  size = 'md',
}: StatusBadgeProps): React.JSX.Element {
  const { variant, label } = STATUS_MAP[status];

  return <Badge label={label} variant={variant} size={size} />;
});
