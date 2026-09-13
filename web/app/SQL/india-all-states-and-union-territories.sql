-- LocalStreetShop India: add all 28 states + 8 union territories.
-- Safe to run more than once. Existing rows such as Gujarat are kept.

DO $$
DECLARE
  india_country_id uuid;
BEGIN
  SELECT id INTO india_country_id
  FROM public.countries
  WHERE lower(slug) = 'india'
  LIMIT 1;

  IF india_country_id IS NULL THEN
    RAISE EXCEPTION 'India country row was not found in public.countries';
  END IF;

  INSERT INTO public.provinces (name, slug, country_id)
  SELECT v.name, v.slug, india_country_id
  FROM (VALUES
    ('Andhra Pradesh', 'andhra-pradesh'),
    ('Arunachal Pradesh', 'arunachal-pradesh'),
    ('Assam', 'assam'),
    ('Bihar', 'bihar'),
    ('Chhattisgarh', 'chhattisgarh'),
    ('Goa', 'goa'),
    ('Gujarat', 'gujarat'),
    ('Haryana', 'haryana'),
    ('Himachal Pradesh', 'himachal-pradesh'),
    ('Jharkhand', 'jharkhand'),
    ('Karnataka', 'karnataka'),
    ('Kerala', 'kerala'),
    ('Madhya Pradesh', 'madhya-pradesh'),
    ('Maharashtra', 'maharashtra'),
    ('Manipur', 'manipur'),
    ('Meghalaya', 'meghalaya'),
    ('Mizoram', 'mizoram'),
    ('Nagaland', 'nagaland'),
    ('Odisha', 'odisha'),
    ('Punjab', 'punjab'),
    ('Rajasthan', 'rajasthan'),
    ('Sikkim', 'sikkim'),
    ('Tamil Nadu', 'tamil-nadu'),
    ('Telangana', 'telangana'),
    ('Tripura', 'tripura'),
    ('Uttar Pradesh', 'uttar-pradesh'),
    ('Uttarakhand', 'uttarakhand'),
    ('West Bengal', 'west-bengal'),
    ('Andaman and Nicobar Islands', 'andaman-and-nicobar-islands'),
    ('Chandigarh', 'chandigarh'),
    ('Dadra and Nagar Haveli and Daman and Diu', 'dadra-and-nagar-haveli-and-daman-and-diu'),
    ('Delhi', 'delhi'),
    ('Jammu and Kashmir', 'jammu-and-kashmir'),
    ('Ladakh', 'ladakh'),
    ('Lakshadweep', 'lakshadweep'),
    ('Puducherry', 'puducherry')
  ) AS v(name, slug)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.provinces p
    WHERE p.country_id = india_country_id
      AND (lower(p.slug) = lower(v.slug) OR lower(p.name) = lower(v.name))
  );
END $$;

-- Verification: should return 36 rows for India after the insert.
SELECT p.name, p.slug
FROM public.provinces p
JOIN public.countries c ON c.id = p.country_id
WHERE c.slug = 'india'
ORDER BY p.name;
