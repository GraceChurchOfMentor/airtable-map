import loadGoogleMapsApi from 'load-google-maps-api';
import Airtable from 'airtable';

import '../styles/index.scss';

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: process.env.AIRTABLE_API_KEY,
});

loadGoogleMapsApi({
    key: process.env.GOOGLE_MAPS_API_KEY,
}).then(googleMaps => {
    const base = new Airtable().base(process.env.AIRTABLE_BASE);
    const map = new googleMaps.Map(document.querySelector('#app'), {
        center: {
            lat: parseFloat(process.env.MAP_CENTER_LAT),
            lng: parseFloat(process.env.MAP_CENTER_LNG)
        },
        zoom: parseInt(process.env.MAP_ZOOM),
    });

    base(process.env.AIRTABLE_TABLE).select({
        view: process.env.AIRTABLE_VIEW
    }).eachPage((records, fetchNextPage) => {
        records.forEach(function(record) {
            const data = JSON.parse(atob(record.get(process.env.AIRTABLE_GEO_FIELD).replace('🔵 ', '')));
            if (data.o.status === "OK") {
                const marker = new googleMaps.Marker({
                    position: new googleMaps.LatLng({
                        lat: data.o.lat,
                        lng: data.o.lng,
                    }),
                    map: map
                });
            }
        });

        fetchNextPage();
    }, err => {
        if (err) { console.error(err); return; }
    });
}).catch(error => {
    console.error(error);
});