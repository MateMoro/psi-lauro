-- Temporarily allow anonymous users to view patient data for demo purposes
-- This should be restricted in production environments
DROP POLICY IF EXISTS "Authenticated medical staff can view patient data" ON public.pacientes_planalto;

CREATE POLICY "Allow demo access to patient data" 
ON public.pacientes_planalto 
FOR SELECT 
USING (
  -- Allow authenticated users with medical roles
  (auth.uid() IS NOT NULL AND (
    user_has_role(auth.uid(), 'admin'::text) OR 
    user_has_role(auth.uid(), 'doctor'::text) OR 
    user_has_role(auth.uid(), 'nurse'::text) OR 
    user_has_role(auth.uid(), 'analyst'::text)
  ))
  -- OR allow anonymous access for demo purposes
  OR auth.uid() IS NULL
);