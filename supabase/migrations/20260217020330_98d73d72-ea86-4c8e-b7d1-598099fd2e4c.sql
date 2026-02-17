
-- Add parent_id to libraries for nested folder structure (up to 4 levels)
ALTER TABLE public.libraries ADD COLUMN parent_id uuid REFERENCES public.libraries(id) ON DELETE CASCADE DEFAULT NULL;

-- Index for fast lookups of children
CREATE INDEX idx_libraries_parent_id ON public.libraries(parent_id);

-- Function to check nesting depth (max 4 levels)
CREATE OR REPLACE FUNCTION public.check_library_depth()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  depth integer := 1;
  current_parent uuid := NEW.parent_id;
BEGIN
  WHILE current_parent IS NOT NULL LOOP
    depth := depth + 1;
    IF depth > 4 THEN
      RAISE EXCEPTION 'Maximum nesting depth of 4 levels exceeded';
    END IF;
    SELECT parent_id INTO current_parent FROM public.libraries WHERE id = current_parent;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_library_nesting_depth
BEFORE INSERT OR UPDATE ON public.libraries
FOR EACH ROW
EXECUTE FUNCTION public.check_library_depth();
