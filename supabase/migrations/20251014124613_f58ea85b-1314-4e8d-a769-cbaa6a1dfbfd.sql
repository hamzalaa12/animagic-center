-- Improve RLS policies for scraper_sources to allow admins to insert
DROP POLICY IF EXISTS "Admins can manage scraper sources" ON public.scraper_sources;

CREATE POLICY "Admins can manage scraper sources"
ON public.scraper_sources
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));