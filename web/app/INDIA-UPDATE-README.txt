LOCALSTREETSHOP INDIA EXPANSION UPDATE
=====================================

What changed
------------
1. India business form now has a required dropdown containing all 28 states and 8 union territories.
2. Gujarat is no longer the hidden/default state. Owners must choose the correct state/UT.
3. The India submission API no longer silently falls back to Gujarat.
4. India still uses the flexible approval workflow: admins can approve a new city, street/market and complex/location and those records are created automatically.
5. The regular Shop Owner > Add Shop page now detects India and directs the owner to the India flexible-address form instead of forcing them through preloaded city/street dropdowns.
6. Generic public routes were added for non-Gujarat states:
   /countries/india/[state]
   /countries/india/[state]/[city]
   /countries/india/[state]/[city]/streets/[street]
   /countries/india/[state]/[city]/streets/[street]/[shop]
   Existing Gujarat pages remain unchanged.
7. SQL/india-all-states-and-union-territories.sql safely inserts all Indian states/UTs without duplicating Gujarat.

Deployment order
----------------
A. Run SQL/india-all-states-and-union-territories.sql in Supabase SQL Editor first.
B. Copy/replace the app files from this ZIP into your project app folder, preserving the folder structure.
C. Run npm run build locally if desired.
D. Commit, push and deploy to Vercel.

For the current Relax Sofa Cum Bed submission
---------------------------------------------
The existing incorrect submission can be rejected/deleted and the owner can resubmit using:
India > Delhi > New Delhi > Kirti Nagar / WHS.
Or you can manually correct it before approval if your admin review screen supports changing the state/city/street assignment.
