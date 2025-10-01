# Admin UX Improvement Plan

## Overview
Comprehensive UX improvements for `/admin` orders page without changing routes or data models.

## Current Architecture
- **Main Page**: `/src/app/admin/page.tsx` - Uses new component-based architecture
- **Components**:
  - `AdminKpiBar.tsx` - Revenue/orders metrics
  - `SegmentedTabs.tsx` - Status tabs
  - `FilterBar.tsx` - Filters
  - `InfiniteOrderList.tsx` - Order cards list
  - `BottomOpsBar.tsx` - Operations controls
  - `AssignDriverModal.tsx` - Driver assignment
  - `OrderListItem.tsx` - Individual order card

## Implementation Phases

### Phase 1: Delivered Tab Cleanup ✅ PRIORITY
**Files to modify**: `OrderListItem.tsx`, `InfiniteOrderList.tsx`

**Changes**:
1. Add conditional rendering based on `status === 'delivered'`
2. Replace action buttons with:
   - View Receipt button
   - Proof of Delivery button  
   - Refund/Issue button
3. Add SLA line: "Placed {relativeTime} • SLA {minutes} (met/missed)"
4. Calculate SLA from `created_at` to `delivered_at` (need to add this field)

**Code Pattern**:
```tsx
{status === 'delivered' ? (
  <div className="flex gap-2">
    <button>View Receipt</button>
    <button>Proof of Delivery</button>
    <button>Refund/Issue</button>
  </div>
) : (
  // Existing action buttons
)}
```

### Phase 2: Card Info Polish ✅ PRIORITY
**Files to modify**: `OrderListItem.tsx`, `StatusChip.tsx`

**Changes**:
1. Status chip colors:
   - Pending → amber
   - Assigned → blue
   - Delivered → green
   - Issue → rose
2. Tooltip on total showing breakdown
3. Masked phone display
4. Time preference badge (ASAP/Wave)
5. TEST badge for `is_test` orders

**Code Pattern**:
```tsx
<div className="relative group">
  <span className="font-bold">{formatCurrency(total)}</span>
  <div className="absolute hidden group-hover:block ...">
    Subtotal: {subtotal}<br/>
    Delivery: {delivery_fee}<br/>
    Tip: {tip}
  </div>
</div>
```

### Phase 3: Filters & Sort Enhancement
**Files to modify**: `FilterBar.tsx`, `/src/app/admin/page.tsx`

**Changes**:
1. Add Zone filter (Farragut, Mt Vernon, Navy Yard)
2. Add Time Window filter (ASAP/Wave/Later)
3. Add Sort dropdown (Age, Amount, Distance)
4. Persist in URL query params
5. Make filter bar sticky

**URL Pattern**: `?tab=assigned&zone=farragut&sort=age`

### Phase 4: Bulk Actions
**Files to modify**: `InfiniteOrderList.tsx`, new `BulkActionsBar.tsx`

**Changes**:
1. Add checkbox to each card
2. Create bulk actions bar (appears when items selected)
3. Actions: Assign, Mark Delivered, Mark Issue
4. Confirmation dialogs
5. Only show on Pending/Assigned tabs

### Phase 5: Assign Flow Improvement
**Files to modify**: `AssignDriverModal.tsx`

**Changes**:
1. Add search functionality
2. Show driver columns: Name, Zone, Status, Last Ping
3. Optimistic UI update
4. Real-time driver status

### Phase 6: Ops Controls Enhancement
**Files to modify**: `AdminKpiBar.tsx`, `BottomOpsBar.tsx`

**Changes**:
1. Add toggle group in header for ops flags
2. Add capacity meter: "ASAP (15m) 0/20"
3. Color coding: green → amber → red
4. Sync with bottom bar

### Phase 7: Realtime & Notifications
**Files to modify**: `/src/app/admin/page.tsx`

**Changes**:
1. Subscribe to Supabase realtime channel
2. Toast notifications for new orders
3. Optional sound alert
4. Update cards in place on changes

**Code Pattern**:
```tsx
useEffect(() => {
  const channel = supabase
    .channel('orders')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'orders'
    }, (payload) => {
      toast.success('New order received!');
      // Update state
    })
    .subscribe();
  
  return () => { supabase.removeChannel(channel); };
}, []);
```

### Phase 8: Error Handling
**Files to modify**: All components with data fetching

**Changes**:
1. Replace silent failures with error states
2. Add retry buttons
3. Log Supabase errors to console
4. Show user-friendly error messages

## Database Schema Additions Needed

### Orders Table
```sql
-- Add if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS time_window TEXT; -- 'asap', 'wave', 'later'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tip DECIMAL(10,2) DEFAULT 0;
```

### Drivers Table
```sql
-- Add if not exists
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS zone TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS last_ping_at TIMESTAMP;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'idle'; -- 'active', 'idle', 'offline'
```

## API Endpoints Needed

### Existing (verify)
- `GET /api/admin/orders` - List orders with filters
- `POST /api/admin/orders/{id}/assign` - Assign driver
- `GET /api/admin/drivers` - List drivers

### New (create)
- `POST /api/admin/orders/bulk-assign` - Bulk assign
- `POST /api/admin/orders/bulk-status` - Bulk status update
- `GET /api/admin/orders/{id}/receipt` - Get receipt data
- `POST /api/admin/orders/{id}/refund` - Process refund
- `GET /api/admin/kpi/capacity` - Get ASAP capacity

## Testing Checklist

- [ ] Delivered tab shows correct buttons
- [ ] SLA calculation accurate
- [ ] Status chips have correct colors
- [ ] Tooltip shows on total hover
- [ ] Filters persist in URL
- [ ] Bulk actions work correctly
- [ ] Assign modal searchable
- [ ] Optimistic updates work
- [ ] Realtime updates received
- [ ] Error states show retry
- [ ] Capacity meter updates
- [ ] TEST orders are dimmed

## Rollout Strategy

1. **Phase 1-2**: Deploy card improvements (low risk)
2. **Phase 3**: Deploy filters (medium risk)
3. **Phase 4-5**: Deploy bulk actions & assign (high risk - test thoroughly)
4. **Phase 6-7**: Deploy ops controls & realtime (medium risk)
5. **Phase 8**: Deploy error handling (low risk)

## Estimated Effort
- Phase 1-2: 2-3 hours
- Phase 3: 1-2 hours
- Phase 4-5: 3-4 hours
- Phase 6-7: 2-3 hours
- Phase 8: 1 hour
- **Total**: 9-13 hours

## Notes
- Keep existing `/admin/orders` route (legacy) for now
- Focus on `/admin` (new architecture) for improvements
- All changes should be backwards compatible
- No breaking changes to data models
