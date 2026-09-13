export interface InquiryData {
  id?: string;
  fullName: string;
  phone: string;
  vehicle: string;
  service: string;
  notes?: string;
  createdAt: string;
  status: string;
  source?: string;
}

const memoryStore: InquiryData[] = [];

// User's configured Firebase Realtime Database endpoint
const RTDB_BASE_URL = 'https://car-editz-default-rtdb.firebaseio.com';

export async function saveInquiry(data: {
  fullName: string;
  phone: string;
  vehicle: string;
  service: string;
  notes?: string;
}): Promise<{ id: string; savedToFirebase: boolean; savedToRtdb: boolean }> {
  const timestamp = new Date().toISOString();
  const inquiryRecord: InquiryData = {
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    vehicle: data.vehicle.trim(),
    service: data.service.trim(),
    notes: data.notes?.trim() || '',
    createdAt: timestamp,
    status: 'pending',
    source: 'car-editz-web'
  };

  let assignedId = 'inq_' + Date.now();
  let savedToRtdb = false;

  // 1. Save to Firebase Realtime Database (car-editz-default-rtdb)
  try {
    const rtdbRes = await fetch(`${RTDB_BASE_URL}/inquiries.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryRecord)
    });
    if (rtdbRes.ok) {
      const rtdbData = await rtdbRes.json();
      if (rtdbData && rtdbData.name) {
        assignedId = rtdbData.name;
        savedToRtdb = true;
      }
    }
  } catch (rtdbErr) {
    console.warn('Error writing to Firebase Realtime Database:', rtdbErr);
  }

  inquiryRecord.id = assignedId;
  memoryStore.unshift(inquiryRecord);

  return {
    id: assignedId,
    savedToFirebase: savedToRtdb,
    savedToRtdb
  };
}

export async function getRecentInquiries(maxCount = 25): Promise<InquiryData[]> {
  // Query Firebase Realtime Database using properly encoded parameters
  try {
    const rtdbRes = await fetch(
      `${RTDB_BASE_URL}/inquiries.json?orderBy=%22%24key%22&limitToLast=${maxCount}`
    );
    if (rtdbRes.ok) {
      const data = await rtdbRes.json();
      if (data && typeof data === 'object' && !data.error) {
        const list: InquiryData[] = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        // Sort descending by timestamp/key
        list.reverse();
        if (list.length > 0) {
          return list.slice(0, maxCount);
        }
      }
    }
  } catch (e) {
    console.warn('Error fetching from Firebase Realtime Database:', e);
  }

  return memoryStore.slice(0, maxCount);
}
