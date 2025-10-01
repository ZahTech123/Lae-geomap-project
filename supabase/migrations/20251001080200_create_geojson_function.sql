CREATE OR REPLACE FUNCTION get_properties_with_details_geojson()
RETURNS jsonb AS $$
DECLARE
    geojson jsonb;
BEGIN
    SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(features.feature)
    )
    INTO geojson
    FROM (
        SELECT jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(p.geom)::jsonb,
            'properties', jsonb_build_object(
                'property_id', p.property_id,
                'building_id', p.building_id,
                'parcel_id', p.parcel_id,
                'section', p.section,
                'lot', p.lot,
                'val_no', p.val_no,
                'building_name', p.building_name,
                'address', p.address,
                'land_details', p.land_details,
                'building_details', p.building_details,
                'image_url', p.image_url,
                -- Flatten owner details
                'owner_id', o.owner_id,
                'owner_name', o.owner_name,
                'contact_info', o.contact_info,
                'title_reference', o.title_reference,
                'term_of_lease', o.term_of_lease,
                'date_of_grant', o.date_of_grant,
                -- Flatten planning data (assuming one planning record per property for simplicity in display)
                'zoning_code', pd.zoning_code,
                'permit_status', pd.permit_status,
                'last_updated_by', pd.last_updated_by,
                'last_updated_at', pd.last_updated_at,
                -- Flatten tax records (assuming one tax record per property for simplicity in display)
                'tax_year', tr.tax_year,
                'amount_due', tr.amount_due,
                'payment_status', tr.payment_status,
                'record_date', tr.record_date
            )
        ) AS feature
        FROM properties p
        LEFT JOIN owners o ON p.parcel_id = o.parcel_id
        LEFT JOIN planning_data pd ON p.property_id = pd.property_id
        LEFT JOIN tax_records tr ON p.property_id = tr.property_id
    ) AS features;

    RETURN geojson;
END;
$$ LANGUAGE plpgsql;
