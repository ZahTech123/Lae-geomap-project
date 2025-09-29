# Owner Data Integration Guide

This document outlines the steps taken to integrate and display property owner information within the Lae GeoMap application.

## Objective

The primary goal was to connect the `owners` table to the `properties` table in the Supabase backend and display the corresponding owner details on the React frontend when a user clicks on a map feature.

## 1. Backend Modification (Supabase)

To combine the property and owner data, the `get_all_properties_geojson()` PostgreSQL function in Supabase was updated. This function now performs a `LEFT JOIN` to enrich the GeoJSON features with owner details.

### Updated Supabase Function

The following SQL script should be run in your Supabase SQL Editor to update the function:

```sql
CREATE OR REPLACE FUNCTION get_all_properties_geojson()
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(features.feature)
    )
    FROM (
      SELECT jsonb_build_object(
        'type', 'Feature',
        'id', p.property_id,
        'geometry', ST_AsGeoJSON(p.geom)::jsonb,
        'properties', jsonb_build_object(
          'prop_details', to_jsonb(p) - 'geom' - 'owner_user_id',
          'owner_details', to_jsonb(o)
        )
      ) AS feature
      FROM
        public.properties AS p
      LEFT JOIN
        public.owners AS o ON p.parcel_id = o.parcel_id
    ) AS features
  );
END;
$$ LANGUAGE plpgsql;
```

This change nests the property and owner details into `prop_details` and `owner_details` objects within each GeoJSON feature's properties.

## 2. Frontend Modifications (React)

The React frontend was updated to correctly parse the new nested data structure and display the owner's information in the UI.

### `src/pages/MapView.tsx`

The `handleFeatureClick` function was initially modified to parse what was thought to be a single stringified JSON object.

**Initial Change:**
```javascript
  const handleFeatureClick = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    if (feature.properties) {
      // The properties from the Supabase function are stringified JSON
      const properties = JSON.parse(feature.properties.properties);
      setSelectedPropertyId(properties.prop_details.property_id);
      setSelectedPropertyDetails(properties); // Pass the whole nested object
    }
  };
```

### `src/components/panels/PropertyDetailsPanel.tsx`

This component was updated to display the owner's information. The contact information was moved from the "Ownership Information" section to the "Address" field within the "Property Information" section. The "Address" field now conditionally displays the contact information if available, otherwise it shows the property address. The original contact line was removed from the "Ownership Information" card.

**Changes:**
1.  The `propertyDetails` prop is now destructured to access the nested `prop_details` and `owner_details` objects.
2.  The `Address` line in the `Property Information` card was updated to conditionally display `owner_details.contact_info` or `prop_details.address`.
3.  The `Contact` line was removed from the `Ownership Information` card.

```javascript
  // Destructure the nested objects from the propertyDetails prop
  const { prop_details, owner_details } = propertyDetails;

  // ... inside the return statement ...

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Address:</strong> {owner_details?.contact_info ? owner_details.contact_info : prop_details.address}</p>
          {/* ... other property details ... */}
        </CardContent>
      </Card>

      {/* New Card for Ownership Information */}
      <Card>
        <CardHeader>
          <CardTitle>Ownership Information</CardTitle>
        </CardHeader>
        <CardContent>
          {owner_details ? (
            <div>
              <p><strong>Owner:</strong> {owner_details.owner_name || 'Not Registered'}</p>
              <p><strong>Lease Term:</strong> {owner_details.term_of_lease || 'N/A'}</p>
              <p><strong>Title Reference:</strong> {owner_details.title_reference || 'N/A'}</p>
            </div>
          ) : (
            <p>No owner information available for this property.</p>
          )}
        </CardContent>
      </Card>
```

## 3. Troubleshooting: Fixing the Click Event

After the initial implementation, an issue was discovered where clicking on a property feature did not display the details panel. The browser console revealed that the data structure was not being parsed correctly.

### The Problem

The `get_all_properties_geojson()` function in Supabase returns a `properties` object where the `prop_details` and `owner_details` values are *themselves* stringified JSON. The initial frontend code was attempting to parse the entire `properties` object, which was incorrect.

### The Fix: `src/pages/MapView.tsx`

The `handleFeatureClick` function was updated to correctly parse the nested JSON strings and reconstruct the data object for the details panel.

**Final Code:**
```javascript
  const handleFeatureClick = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    if (feature.properties && feature.properties.prop_details) {
      try {
        const prop_details = JSON.parse(feature.properties.prop_details);
        const owner_details = feature.properties.owner_details
          ? JSON.parse(feature.properties.owner_details)
          : null;

        const combinedDetails = {
          prop_details,
          owner_details,
        };

        setSelectedPropertyId(prop_details.property_id);
        setSelectedPropertyDetails(combinedDetails);
      } catch (error) {
        console.error('Failed to parse feature properties:', error);
      }
    }
  };
```

## 4. Feature Removal: "Feature Query" and "Building Footprints"

The "Feature Query" and "Building Footprints" features were removed from the application to streamline functionality.

### Changes:
1.  The "Building Footprints" layer was removed from `src/components/layout/GISSidebar.tsx`.
2.  The `src/components/toolbar/FeatureQuery.tsx` file was deleted.
3.  All import statements and JSX related to the search input functionality were removed from `src/components/toolbar/GISToolbar.tsx`.
4.  No lingering references to `FeatureQuery` were found in `src/pages/MapView.tsx` or `src/App.tsx`.

## 5. Data Sources Tabulation and Search

To provide users with an overall look at various datasets in a tabulated and searchable format, a new "Data Sources" section was implemented.

### Changes:
1.  **Created `src/pages/DataSourcesPage.tsx`**: This new React component was developed to handle the fetching, display, and search functionality for multiple datasets.
2.  **Supabase Service Enhancements (`src/integrations/supabase/services.ts`)**:
    *   Added `export type Property = Database['public']['Tables']['properties']['Row'];` and `export type CustomerLot = Database['public']['Tables']['customer_lots']['Row'];` to define types for new datasets.
    *   Implemented `fetchAllTaxRecords()` to fetch all records from the `tax_records` table.
    *   Implemented `fetchAllProperties()` to fetch all records from the `properties` table.
    *   Implemented `fetchAllCustomerLots()` to fetch all records from the `customer_lots` table.
3.  **Dynamic Data Display in `src/pages/DataSourcesPage.tsx`**:
    *   The component now manages state for `taxRecords`, `properties`, and `customerLots`.
    *   A `Tabs` component (`@/components/ui/tabs`) was integrated to allow users to switch between viewing "Tax Records", "Properties", and "Customer Lots" datasets.
    *   Each tab dynamically renders a `Table` (`@/components/ui/table`) with appropriate headers and rows corresponding to the selected dataset's structure.
4.  **Search Functionality**: An `Input` component (`@/components/ui/input`) was added to `DataSourcesPage.tsx` to enable real-time filtering of the currently displayed dataset based on user input.
5.  **Routing Update (`src/App.tsx`)**: The main application router was updated to replace the placeholder `div` for the `/data` route with the new `DataSourcesPage` component, making the new functionality accessible via the "Data Sources" link in the sidebar.

-- =======================================================================
-- POPULATE 'tax_records' - BATCH 1 (Corrected) of records 1-100
-- This script uses lpad() to match the zero-padded format of section/lot
-- numbers in the 'properties' table, ensuring a successful join.
-- =======================================================================

INSERT INTO public.tax_records (
  property_id,
  customer_name,
  tax_year,
  amount_due,
  payment_status
)
SELECT
  -- Get the property_id from the existing properties table
  p.property_id,

  -- Get the customer name from the JSON data. Turns empty strings into NULL.
  NULLIF(c.value ->> 'customer_name', ''),

  -- Set a default tax year of 2018 based on the "Land Tax Listings (2017-2018)" source.
  2018 AS tax_year,
  
  -- Set a placeholder amount. This would later be updated from the full tax roll.
  0.00 AS amount_due,

  -- Use the default 'Unpaid' status from your table schema.
  'Unpaid' AS payment_status
FROM
  -- Unpack the first 100 customer JSON records into a set of rows
  jsonb_array_elements('[
    { "customer_id": "custw2_01", "customer_name": "DON ANJO", "section": "1", "lot(s)": "1" },
    { "customer_id": "custw2_02", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "2" },
    { "customer_id": "custw2_03", "customer_name": "DR JOEL KIA", "section": "1", "lot(s)": "3" },
    { "customer_id": "custw2_04", "customer_name": "LAE INTERNATIONAL HOTEL", "section": "1", "lot(s)": "4" },
    { "customer_id": "custw2_05", "customer_name": "LAE INTERNATIONAL HOTEL", "section": "1", "lot(s)": "5" },
    { "customer_id": "custw2_06", "customer_name": "LAE INTERNATIONAL HOTEL", "section": "1", "lot(s)": "6" },
    { "customer_id": "custw2_07", "customer_name": "LAE INTERNATIONAL HOTEL", "section": "1", "lot(s)": "7" },
    { "customer_id": "custw2_08", "customer_name": "LAE INTERNATIONAL HOTEL", "section": "1", "lot(s)": "8" },
    { "customer_id": "custw2_09", "customer_name": "", "section": "1", "lot(s)": "9" },
    { "customer_id": "custw2_10", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "10" },
    { "customer_id": "custw2_11", "customer_name": "", "section": "1", "lot(s)": "11" },
    { "customer_id": "custw2_12", "customer_name": "MR & MRS J B RYU", "section": "1", "lot(s)": "12" },
    { "customer_id": "custw2_13", "customer_name": "", "section": "1", "lot(s)": "13" },
    { "customer_id": "custw2_14", "customer_name": "NATHANIEL POYA", "section": "1", "lot(s)": "14" },
    { "customer_id": "custw2_15", "customer_name": "WAYNE NORUMU", "section": "1", "lot(s)": "15" },
    { "customer_id": "custw2_16", "customer_name": "", "section": "1", "lot(s)": "16" },
    { "customer_id": "custw2_17", "customer_name": "", "section": "1", "lot(s)": "17" },
    { "customer_id": "custw2_18", "customer_name": "TELIKOM PNG LTD", "section": "1", "lot(s)": "18" },
    { "customer_id": "custw2_19", "customer_name": "SALAMAUA HOLDINGS PTY LTD", "section": "1", "lot(s)": "19" },
    { "customer_id": "custw2_20", "customer_name": "SALAMAUA HOLDINGS PTY LTD", "section": "1", "lot(s)": "20" },
    { "customer_id": "custw2_21", "customer_name": "SALAMAUA HOLDINGS PTY LTD", "section": "1", "lot(s)": "21" },
    { "customer_id": "custw2_22", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "22" },
    { "customer_id": "custw2_23", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "23" },
    { "customer_id": "custw2_24", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "24" },
    { "customer_id": "custw2_25", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "25" },
    { "customer_id": "custw2_26", "customer_name": "", "section": "1", "lot(s)": "26" },
    { "customer_id": "custw2_27", "customer_name": "SALAMAUA HOLDINGS PTY LTD", "section": "1", "lot(s)": "27" },
    { "customer_id": "custw2_28", "customer_name": "SIEGMUND ANGELO PELGEN", "section": "1", "lot(s)": "28" },
    { "customer_id": "custw2_29", "customer_name": "SIEGMUND ANGELO PELGEN", "section": "1", "lot(s)": "29" },
    { "customer_id": "custw2_30", "customer_name": "SIOS WORKERS RITAIA FUND", "section": "1", "lot(s)": "30" },
    { "customer_id": "custw2_31", "customer_name": "TELIKOM PNG LTD", "section": "1", "lot(s)": "31" },
    { "customer_id": "custw2_32", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "32" },
    { "customer_id": "custw2_33", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "33" },
    { "customer_id": "custw2_34", "customer_name": "", "section": "1", "lot(s)": "34" },
    { "customer_id": "custw2_35", "customer_name": "", "section": "1", "lot(s)": "35" },
    { "customer_id": "custw2_36", "customer_name": "", "section": "1", "lot(s)": "36" },
    { "customer_id": "custw2_37", "customer_name": "", "section": "1", "lot(s)": "37" },
    { "customer_id": "custw2_38", "customer_name": "ELITE PROPERTIES PTY LTD", "section": "1", "lot(s)": "38" },
    { "customer_id": "custw2_39", "customer_name": "TELIKOM PNG LTD", "section": "1", "lot(s)": "39" },
    { "customer_id": "custw2_40", "customer_name": "KEN PETAKIN", "section": "1", "lot(s)": "40" },
    { "customer_id": "custw2_41", "customer_name": "NATIONAL HOUSING CORPORATION", "section": "1", "lot(s)": "41" },
    { "customer_id": "custw2_42", "customer_name": "TELIKOM PNG LTD", "section": "1", "lot(s)": "42" },
    { "customer_id": "custw2_43", "customer_name": "MOREAINA WEI", "section": "1", "lot(s)": "43" },
    { "customer_id": "custw2_44", "customer_name": "MR MAIMA SINE", "section": "1", "lot(s)": "44" },
    { "customer_id": "custw2_45", "customer_name": "", "section": "1", "lot(s)": "45" },
    { "customer_id": "custw2_46", "customer_name": "NATIONAL HOUSING CORPORATION", "section": "1", "lot(s)": "46" },
    { "customer_id": "custw2_47", "customer_name": "MOGI WEI JUNIOR", "section": "1", "lot(s)": "47" },
    { "customer_id": "custw2_48", "customer_name": "GIMEGE & SEAGOS GROUP OF COM.", "section": "1", "lot(s)": "48" },
    { "customer_id": "custw2_49", "customer_name": "CITY GUEST HAUS", "section": "1", "lot(s)": "49" },
    { "customer_id": "custw2_50", "customer_name": "", "section": "1", "lot(s)": "50" },
    { "customer_id": "custw2_51", "customer_name": "", "section": "1", "lot(s)": "53" },
    { "customer_id": "custw2_52", "customer_name": "CIVIL AVIATION", "section": "1", "lot(s)": "54" },
    { "customer_id": "custw2_53", "customer_name": "STEAMSHIPS LTD/N POYA PTY LTD", "section": "1", "lot(s)": "55" },
    { "customer_id": "custw2_54", "customer_name": "GIMEGE & SEAGOS GROUP OF COM.", "section": "1", "lot(s)": "56" },
    { "customer_id": "custw2_55", "customer_name": "TRUSTEES FOR THE Y.W.C.A", "section": "1", "lot(s)": "57" },
    { "customer_id": "custw2_56", "customer_name": "TRUSTEES FOR THE Y.W.C.A", "section": "1", "lot(s)": "58" },
    { "customer_id": "custw2_57", "customer_name": "SEK NO.15 PTY LTD", "section": "1", "lot(s)": "59" },
    { "customer_id": "custw2_58", "customer_name": "RAWSON & LORNA SETA", "section": "1", "lot(s)": "60" },
    { "customer_id": "custw2_59", "customer_name": "NATIONAL HOUSING CORPORATION", "section": "1", "lot(s)": "61" },
    { "customer_id": "custw2_60", "customer_name": "ROTONA RIVONA", "section": "1", "lot(s)": "62" },
    { "customer_id": "custw2_61", "customer_name": "JIM TAPAKO HOLDINGS PTY LTD", "section": "1", "lot(s)": "63" },
    { "customer_id": "custw2_62", "customer_name": "LOMBDA PTY LTD", "section": "1", "lot(s)": "64" },
    { "customer_id": "custw2_63", "customer_name": "NATIONAL HOUSING CORPORATION", "section": "1", "lot(s)": "65" },
    { "customer_id": "custw2_64", "customer_name": "", "section": "1", "lot(s)": "66" },
    { "customer_id": "custw2_65", "customer_name": "", "section": "1", "lot(s)": "67" },
    { "customer_id": "custw2_66", "customer_name": "JENNIFER & EZEKIEL PARAIDE", "section": "1", "lot(s)": "68" },
    { "customer_id": "custw2_67", "customer_name": "SALAMAUA HOLDINGS PTY LTD", "section": "1", "lot(s)": "69" },
    { "customer_id": "custw2_68", "customer_name": "", "section": "1", "lot(s)": "70" },
    { "customer_id": "custw2_69", "customer_name": "SALAMAUA HOLDINGS PTY LTD", "section": "1", "lot(s)": "72" },
    { "customer_id": "custw2_70", "customer_name": "", "section": "1", "lot(s)": "74" },
    { "customer_id": "custw2_71", "customer_name": "", "section": "1", "lot(s)": "75" },
    { "customer_id": "custw2_72", "customer_name": "ASIAWE DEVELOPMENT PTY LTD", "section": "2", "lot(s)": "1" },
    { "customer_id": "custw2_73", "customer_name": "ASIAWE DEVELOPMENT PTY LTD", "section": "2", "lot(s)": "1" },
    { "customer_id": "custw2_74", "customer_name": "19990309", "section": "2", "lot(s)": "4" },
    { "customer_id": "custw2_75", "customer_name": "KONEBADA NO.38 LIMITED", "section": "2", "lot(s)": "5" },
    { "customer_id": "custw2_76", "customer_name": "KONEBADA NO.38 LIMITED", "section": "2", "lot(s)": "6" },
    { "customer_id": "custw2_77", "customer_name": "KONEBADA NO.38 LIMITED", "section": "2", "lot(s)": "7" },
    { "customer_id": "custw2_78", "customer_name": "LAE CITY COUNCIL", "section": "2", "lot(s)": "8" },
    { "customer_id": "custw2_79", "customer_name": "MATHEW MINAPE", "section": "2", "lot(s)": "23" },
    { "customer_id": "custw2_80", "customer_name": "TELIKOM PNG LTD", "section": "2", "lot(s)": "24" },
    { "customer_id": "custw2_81", "customer_name": "19990309", "section": "2", "lot(s)": "25" },
    { "customer_id": "custw2_82", "customer_name": "19990309", "section": "2", "lot(s)": "26" },
    { "customer_id": "custw2_83", "customer_name": "19990309", "section": "2", "lot(s)": "27" },
    { "customer_id": "custw2_84", "customer_name": "19990309", "section": "2", "lot(s)": "28" },
    { "customer_id": "custw2_85", "customer_name": "REALCO NIUGINI LTD", "section": "2", "lot(s)": "29" },
    { "customer_id": "custw2_86", "customer_name": "19990309", "section": "2", "lot(s)": "30" },
    { "customer_id": "custw2_87", "customer_name": "19990309", "section": "2", "lot(s)": "31" },
    { "customer_id": "custw2_88", "customer_name": "19990309", "section": "2", "lot(s)": "32" },
    { "customer_id": "custw2_89", "customer_name": "PELGEN PTY LTD", "section": "2", "lot(s)": "33" },
    { "customer_id": "custw2_90", "customer_name": "PELGEN PTY LTD", "section": "2", "lot(s)": "34" },
    { "customer_id": "custw2_91", "customer_name": "NUSELA GOPAVE", "section": "2", "lot(s)": "35" },
    { "customer_id": "custw2_92", "customer_name": "MONICA MUEPE", "section": "2", "lot(s)": "36" },
    { "customer_id": "custw2_93", "customer_name": "ELA MOTORS LTD", "section": "2", "lot(s)": "37" },
    { "customer_id": "custw2_94", "customer_name": "WATT KIDDIE", "section": "2", "lot(s)": "38" },
    { "customer_id": "custw2_95", "customer_name": "19990309", "section": "2", "lot(s)": "39" },
    { "customer_id": "custw2_96", "customer_name": "PNG ELECTRICITY COMMISSION", "section": "2", "lot(s)": "40" },
    { "customer_id": "custw2_97", "customer_name": "WILLIAM FREDERICK BELL", "section": "2", "lot(s)": "41" },
    { "customer_id": "custw2_98", "customer_name": "BIBLE SOCIETY OF PNG INC.", "section": "2", "lot(s)": "42" },
    { "customer_id": "custw2_99", "customer_name": "19990309", "section": "2", "lot(s)": "43" },
    { "customer_id": "custw2_100", "customer_name": "EVANGELICAL LUTHERAN CHURCH REAL ESTATE", "section": "2", "lot(s)": "44" }
  ]') AS c(value)
-- Join with the properties table on the matching section and lot numbers
JOIN
  public.properties p 
    ON p.section = lpad(c.value ->> 'section', 4, '0') 
   AND p.lots    = lpad(c.value ->> 'lot(s)', 4, '0');

## 6. Data Analysis Tab with AI Integration

A new "Data Analysis" tab has been implemented to allow users to query an AI (Google Gemini) for insights from the application's data. This feature includes configurable API key management, dynamic data fetching, and a clear conversation option.

### Changes:

1.  **New Page (`src/pages/DataAnalysisPage.tsx`)**:
    *   Created a dedicated page for AI interaction.
    *   Fetches `TaxRecord`, `Property`, and `CustomerLot` data from Supabase services (`src/integrations/supabase/services.ts`).
    *   Serializes fetched data into a structured string format for AI prompts.
    *   Includes an input for user questions, a display for AI responses, and 10 dynamically generated suggested insight questions.
    *   Initializes the Google Generative AI client using an API key from local storage.
    *   The AI response box (`ScrollArea`) height was increased to `h-[500px]` for better readability.
    *   A "Clear" button was added to reset the question input and AI response, allowing users to start a new conversation.
    *   A "Generate Analysis Questions" button was added to the "Suggested Insight Questions" section.
    *   The `generateInitialSuggestedQuestions` function was modified to shuffle and display a random subset of questions, providing dynamic options.

2.  **Sidebar Navigation Update (`src/components/layout/AppSidebar.tsx`)**:
    *   A new "Data Analysis" navigation item with a `Brain` icon has been added, linking to `/data-analysis`.

3.  **Routing Update (`src/App.tsx`)**:
    *   New routes for `/data-analysis` (rendering `DataAnalysisPage`) and `/settings` (rendering `SettingsPage`) were added.

4.  **API Key Configuration (`src/pages/SettingsPage.tsx`)**:
    *   A new settings page was created to provide an input field for configuring and saving the Google Gemini API key to local storage.
    *   The "Settings" dropdown menu item in `src/components/layout/UserDropdown.tsx` now links to this new `/settings` page.

5.  **Dependency Installation**:
    *   The `@google/generative-ai` package was installed using `bun add`.

6.  **Type Definition Alignment**:
    *   The `Property` type definition in `src/integrations/supabase/types.ts` was reviewed, and the `serializeDataForAI` function in `src/pages/DataAnalysisPage.tsx` was adjusted to use only existing properties, resolving previous TypeScript errors.

I have successfully implemented the "Data Analysis" tab with AI integration and API key configuration, increased the size of the AI response box, and added a "Clear" button to reset the conversation.

Here's a summary of the completed work:

1. __`src/pages/DataAnalysisPage.tsx`__:

   - The page now dynamically fetches `TaxRecord`, `Property`, and `CustomerLot` data from Supabase services.
   - The `serializeDataForAI` function prepares this data into a structured string format for the AI prompt, limiting entries for brevity.
   - The AI prompt has been refined to explicitly instruct the AI to analyze the provided GIS property data, tax records, and customer lot information.
   - The suggested insight questions have been updated to be more relevant to the combined dataset.
   - The height of the AI response `ScrollArea` has been increased to `h-[500px]`.
   - A "Clear" button has been added to reset the question input and AI response.
   - A "Generate Analysis Questions" button has been added to the "Suggested Insight Questions" section, which shuffles and displays a random subset of questions.

2. __`src/components/layout/AppSidebar.tsx`__: A new "Data Analysis" navigation item with a `Brain` icon has been added, linking to `/data-analysis`.

3. __`src/App.tsx`__: New routes for `/data-analysis` and `/settings` were added.

4. __Google Generative AI Library__: The `@google/generative-ai` package was installed.

5. __`src/pages/SettingsPage.tsx`__: A new settings page was created to configure and save the Google Gemini API key to local storage.

6. __`src/integrations/supabase/types.ts`__: The `Property` type definition was reviewed, and `serializeDataForAI` was adjusted to use only existing properties, resolving TypeScript errors.

7. __`src/components/layout/UserDropdown.tsx`__: The "Settings" dropdown menu item now links to the new `/settings` page.

You can start the development server to verify these changes by running the following command:

**See new changes

## 7. Navigation Refactoring and Sidebar Cleanup

The application's navigation has been refactored to consolidate the top navigation bar and streamline the sidebar.

### Changes:
1.  **`src/pages/Index.tsx`**:
    *   The header now includes the "LAE URBAN Municipal Management" logo and text, along with the "Map View", "Dashboard", "Data Sources", and "Data Analysis" navigation links.
    *   The "Lae Urban Municipal Management System" text has been removed.
    *   The `onLayerToggle` function has been removed as it is no longer needed.
2.  **`src/components/layout/AppSidebar.tsx`**:
    *   The "Main" section, including the logo and navigation items, has been removed.
    *   The "Tools" and "Layers" sections, along with their associated imports and variables, have been removed.
    *   All unused imports, including `morobeFlag`, `Map`, `BarChart3`, `Database`, `Brain`, `Settings`, `Globe`, `NavLink`, `SidebarGroup`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuButton`, `SidebarMenuItem`, and `useState` have been removed.
    *   The `onLayerToggle` prop has been removed from the `AppSidebar` component.

The application's navigation should now reflect these changes, with a consolidated top navigation bar and a streamlined sidebar.
