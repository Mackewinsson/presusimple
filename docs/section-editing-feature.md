# Section Name Editing Feature

## Overview
This feature allows users to edit the names of budget sections directly from the budget interface.

## Implementation Details

### Components Added
- `InlineEdit.tsx` - A reusable inline edit component used for both section and category name editing
- Updated `BudgetSectionItem.tsx` - Now uses the reusable `InlineEdit` component
- Updated `BudgetCategoryItem.tsx` - Now uses the reusable `InlineEdit` component
- Updated `BudgetSetupSection.tsx` - Added section update handler

### Key Features
1. **Inline Editing**: Click the edit button (pencil icon) next to any section or category name to edit it inline
2. **Validation**: Prevents empty names and duplicate section names
3. **Cascade Updates**: When a section name is changed, all categories within that section are automatically updated to reference the new section name
4. **Keyboard Support**: Press Escape to cancel editing, Enter to save
5. **Visual Feedback**: Success/error toasts provide user feedback
6. **DRY Implementation**: Both section and category editing use the same reusable `InlineEdit` component

### User Flow
1. User clicks the edit button (pencil icon) next to a section name
2. The section name becomes an editable input field
3. User can modify the name and press Enter or click the checkmark to save
4. User can press Escape or click the X to cancel
5. If the name is valid, the section and all its categories are updated
6. Success/error message is shown to the user

### Technical Implementation

#### API Changes
- No new API endpoints required
- Uses existing budget and category update endpoints
- Updates both the budget document (section names) and category documents (sectionId references)

#### Database Changes
- No schema changes required
- Existing section structure supports displayName field for user-friendly names

#### State Management
- Uses existing React Query mutations for budget and category updates
- Maintains data consistency across all related queries
- Invalidates relevant query caches after updates

### Error Handling
- Validates for empty names
- Prevents duplicate section names
- Handles API errors gracefully with user-friendly messages
- Rolls back changes if any part of the update fails

### Accessibility
- Keyboard navigation support (Escape to cancel)
- Screen reader friendly with proper ARIA labels
- Focus management for inline editing

## Testing
The feature has been tested manually and integrates with the existing test suite. All existing functionality remains intact.

## Future Enhancements
- Add confirmation dialog for section name changes
- Add undo functionality
- Add bulk section name editing
- Add section name templates or suggestions 