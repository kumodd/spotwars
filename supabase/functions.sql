-- Additional SQL functions to add to your Supabase schema
-- Run this after the main schema.sql

-- Increment click count atomically
CREATE OR REPLACE FUNCTION increment_click(product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE products
  SET click_count = click_count + 1
  WHERE id = product_id
  RETURNING click_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Calculate SpotScore for a product
-- Call this periodically (e.g., via cron) or after major events
CREATE OR REPLACE FUNCTION calculate_spot_score(p_product_id UUID, p_board_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_max_spend INTEGER;
  v_max_clicks INTEGER;
  v_product RECORD;
  v_position RECORD;
  v_score NUMERIC;
  v_norm_spend NUMERIC;
  v_norm_clicks NUMERIC;
  v_pos_score NUMERIC;
BEGIN
  -- Get product stats
  SELECT * INTO v_product FROM products WHERE id = p_product_id;
  SELECT * INTO v_position FROM board_positions WHERE product_id = p_product_id AND board_id = p_board_id;

  -- Get board maxes for normalization
  SELECT MAX(spend_on_board), MAX(p.click_count)
  INTO v_max_spend, v_max_clicks
  FROM board_positions bp
  JOIN products p ON p.id = bp.product_id
  WHERE bp.board_id = p_board_id;

  -- Normalize (0–1)
  v_norm_spend = CASE WHEN v_max_spend > 0 THEN LEAST(v_position.spend_on_board::NUMERIC / v_max_spend, 1) ELSE 0 END;
  v_norm_clicks = CASE WHEN v_max_clicks > 0 THEN LEAST(v_product.click_count::NUMERIC / v_max_clicks, 1) ELSE 0 END;

  -- Position score (higher is better; #1 = 1.0, #100 = 0.01)
  v_pos_score = CASE WHEN v_position.position > 0 THEN 1.0 / v_position.position ELSE 0 END;

  -- Weighted score (0–100)
  v_score = (
    0.40 * v_norm_spend +
    0.30 * v_norm_clicks +
    0.30 * v_pos_score
  ) * 100;

  -- Update product
  UPDATE products SET spot_score = ROUND(v_score, 2) WHERE id = p_product_id;

  RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Recalculate all scores for a board (run after bids)
CREATE OR REPLACE FUNCTION recalculate_board_scores(p_board_id UUID)
RETURNS VOID AS $$
DECLARE
  v_product_id UUID;
BEGIN
  FOR v_product_id IN
    SELECT product_id FROM board_positions WHERE board_id = p_board_id
  LOOP
    PERFORM calculate_spot_score(v_product_id, p_board_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;
