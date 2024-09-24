const url = 'https://api.staging.ehealth.id/fhir/Composition/?date=ge2024-04-01&date=le2024-04-30';

async function fetchAllData() {
    let allData = [];
    let nextUrl = url;
    let assessmentDiagnosisCount = 0;
    let conditionCodeA001Count = 0;

    try {
        while (nextUrl) {
            const response = await fetch(nextUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            if (data.entry && Array.isArray(data.entry)) {
                allData = allData.concat(data.entry);
            }

            const nextLink = data.link ? data.link.find(link => link.relation === 'next') : null;
            nextUrl = nextLink ? nextLink.url : null;
        }

        console.log(`Total data yang diambil: ${allData.length}`);

        for (const item of allData) {
            const resource = item.resource;

            if (resource.section && Array.isArray(resource.section)) {
                for (const section of resource.section) {
                    if (section.title && section.title === "Assessment/Diagnosis") {
                        assessmentDiagnosisCount++;

                        if (section.entry && Array.isArray(section.entry)) {
                            for (const entry of section.entry) {
                                const reference = entry.reference;

                                if (reference && reference.startsWith("Condition/")) {
                                    const conditionUrl = `https://api.staging.ehealth.id/fhir/${reference}`;

                                    const conditionResponse = await fetch(conditionUrl);
                                    if (conditionResponse.ok) {
                                        const conditionData = await conditionResponse.json();

                                        if (conditionData.code && conditionData.code.coding && Array.isArray(conditionData.code.coding)) {
                                            for (const coding of conditionData.code.coding) {
                                                if (coding.code === "A00.1") {
                                                    conditionCodeA001Count++;
                                                    console.log(`Condition dengan code A00.1 ditemukan:`, conditionData);
                                                }
                                            }
                                        }
                                    } else {
                                        console.error(`Error fetching Condition reference: ${conditionResponse.status}`);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        console.log(`Jumlah data dengan title "Assessment/Diagnosis": ${assessmentDiagnosisCount}`);
        console.log(`Jumlah data dengan Condition code "A00.1": ${conditionCodeA001Count}`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAllData();
