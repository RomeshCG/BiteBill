-- Create a function to handle team member removal
CREATE OR REPLACE FUNCTION remove_team_member(p_team_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark the member as removed in team_members instead of deleting
  UPDATE team_members
  SET is_removed = true,
      removed_at = NOW()
  WHERE team_id = p_team_id
    AND user_id = p_user_id;

  -- Mark the member as removed in any active bills
  UPDATE receipt_members
  SET is_removed = true
  WHERE user_id = p_user_id
    AND receipt_id IN (
      SELECT id FROM receipts
      WHERE team_id = p_team_id
    );

  -- Remove any pending invites for this user
  DELETE FROM team_invites
  WHERE team_id = p_team_id
    AND email IN (
      SELECT email FROM profiles
      WHERE id = p_user_id
    );
END;
$$; 