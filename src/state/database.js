// MindMitra Complete Relational Database Schema & Canonical Dataset
// Strictly preserving the Stitch visual source of truth and data architecture

export const initialDatabase = {
  users: [
    {
      id: "user-asha",
      name: "Asha Devi",
      role: "patient",
      age: 72,
      pin: "1234",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0YAy95YXoJS_5vZSXW6X-PnJg1OsTqHJE2auKWrD5E7ybjkztRBBIbPZq3y0AoaM-Eb7-2Qx61e_xOx0bClvELv1MtWm0Z7VfdKvssQV7JArcPSFqwheQMajYjLn1WtA7dzsP7DkKjOMqz60OC8iteQ13hCjAL-3WZhbWP9JoryUyuNiYnvwio5McweNRZW-WZd1RGWNj0z1B2xPhZHGMqCFaED7B18VQpnsX4l16dCIuTMDLx3oi",
      location: "Assam / Shillong morning",
      safeZone: "Sector 4 Care Unit, Shillong",
      emergencyAddress: "House 14, Sector 4, Near Pine Mount, Shillong",
      languages: ["Hindi", "English", "Assamese", "Bengali"]
    },
    {
      id: "user-meera",
      name: "Meera",
      role: "caregiver",
      relation: "Daughter",
      pin: "4321",
      phone: "+91 98450 21345",
      tag: "Primary Caregiver",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw"
    }
  ],

  people: [
    {
      id: "p-meera",
      patientId: "user-asha",
      name: "Meera",
      relation: "Daughter",
      tag: "Primary Caregiver",
      bio: "Always brings homemade ginger tea and checks the jasmine garden. Remembers grandmother's handwritten recipe journal.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw",
      proximity: "3 mins away • Home Safe Zone",
      phone: "+91 98450 21345",
      connectedMemoryIds: ["mem-1", "mem-2", "mem-3", "mem-6"]
    },
    {
      id: "p-ravi",
      patientId: "user-asha",
      name: "Ravi",
      relation: "Son",
      tag: "Secondary Contact",
      bio: "Lives in Bangalore, shares audio stories about childhood festivals in Guwahati and weekly phone check-ins.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSLR5wyHeTfoTjv0tj6tFuVSyYKjKmbJP5zB53DJQR-4IBMTC3zYl0ny63cGt7r5T5J_JjaP_OFqxrIVxT0O_QgBexnBV9uXlln1r8nXiDhW9xpSBbfXcyPc1Bbo7UV5103z5ityhT0tkeuUoJIpAZ7KpH7mdDPACAfIRgWxrRANznpjH6UuHAChacb_unZjtGsZBmyHgDgXLV-5VrcFXcJ3Wx3ofjTO0h76LoMY86BmaWy3-ACBVY",
      proximity: "Bangalore, Karnataka (Remote Sync)",
      phone: "+91 99000 78219",
      connectedMemoryIds: ["mem-7"]
    },
    {
      id: "p-priya",
      patientId: "user-asha",
      name: "Priya",
      relation: "Granddaughter",
      tag: "Family Member",
      bio: "University graduate studying in Delhi, loves showing her grandmother paintings and laughing over old childhood memories.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E",
      proximity: "Delhi (University)",
      phone: "+91 98200 44123",
      connectedMemoryIds: ["mem-1", "mem-5"]
    },
    {
      id: "p-baba",
      patientId: "user-asha",
      name: "Sudhir (Baba)",
      relation: "Late Husband",
      tag: "Family Elder",
      bio: "Longtime professor who loved evening Rabindrasangeet songs, monsoons in Guwahati, and veranda tea with Asha.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      proximity: "Cherished In Memory",
      connectedMemoryIds: ["mem-2", "mem-4"]
    }
  ],

  places: [
    {
      id: "plc-shillong",
      patientId: "user-asha",
      name: "Shillong Pine Ridge",
      region: "Meghalaya",
      location: "Shillong, Meghalaya",
      description: "Misty rolling pine hills, fresh crisp morning tea stalls, and Ward's Lake gardens.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClDv4_h1kT5eVvkSQga6Rvx_Lq8Djf0RbYSnZ_4bH0pymqnPJI0CUfPH_OFAFRdnb4q5neeF6-KbIdEvRhJ5g_sN16VkrP-D1hSLkhgvsZ4RM30Be8DPJAnRJPztn1eDAULI4iC_C_D2w4wpnH2QXI7Saaq4H5cHwoO0C31v8JgFqDak6oJ0y-WhKYLKUM6Szq4IBQDjT_aZARe-HlDuGRjuWkNlx2ojGX1L99zHGVvZnzma-JNT-l",
      connectedMemoryIds: ["mem-1", "act-shillong-recollection"]
    },
    {
      id: "plc-umiam",
      patientId: "user-asha",
      name: "Umiam Lake",
      region: "Meghalaya",
      location: "Umiam Lake, Meghalaya",
      description: "Serene copper-tinted waters reflecting autumn sunsets, surrounded by tall pine forests.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI",
      connectedMemoryIds: ["mem-2"]
    },
    {
      id: "plc-guwahati",
      patientId: "user-asha",
      name: "The Old Guwahati Courtyard",
      region: "Assam",
      location: "Guwahati Old Town, Assam",
      description: "Ancestral red brick house with night jasmine (parijat) trees and monsoon rain drumming on the rooftop.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      connectedMemoryIds: ["mem-4", "mem-7"]
    }
  ],

  events: [
    {
      id: "evt-shillong-2018",
      patientId: "user-asha",
      name: "Autumn Shillong Trip",
      title: "Autumn Shillong Trip",
      date: "October 2018",
      placeId: "plc-shillong",
      description: "Scenic road trip from Guwahati to Shillong with Meera and granddaughter Priya.",
      linkedMemoryIds: ["mem-1", "mem-2"]
    },
    {
      id: "evt-convocation-2022",
      patientId: "user-asha",
      name: "Priya's University Convocation",
      title: "Priya's University Convocation",
      date: "Winter 2022",
      placeId: "plc-delhi",
      description: "Celebration in Delhi with yellow marigold garlands and golden medals.",
      linkedMemoryIds: ["mem-5"]
    },
    {
      id: "evt-durga-puja-2021",
      patientId: "user-asha",
      name: "Durga Puja in Kolkata",
      title: "Durga Puja in Kolkata",
      date: "Autumn 2021",
      placeId: "plc-kolkata",
      description: "Traditional festival with family holding brass lamps and listening to the rhythmic dhak drums.",
      linkedMemoryIds: ["mem-6"]
    }
  ],

  stories: [
    {
      id: "story-1",
      patientId: "user-asha",
      title: "Autumn Spiced Tea at Shillong Stall",
      text: "It was a crisp autumn morning in the Khasi hills. The morning mist was drifting slowly over the emerald green tea bushes. You were wearing your favourite warm ochre shawl. We stopped at the wooden stall by the bend, and the vendor gave us two steaming glasses of spiced ginger tea. You held the warm glass in your hands, closed your eyes, and whispered: 'This smells just like our mornings in Guwahati with Baba.'",
      eventId: "evt-shillong-2018",
      placeId: "plc-shillong",
      personIds: ["p-meera", "p-priya"],
      author: "Meera (Daughter)",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d",
      duration: "3m 40s",
      voiceMemoryId: "vm-1"
    },
    {
      id: "story-2",
      patientId: "user-asha",
      title: "Baba's Song at Umiam Sunset",
      text: "October 2018 at Umiam Lake. The water reflected copper sunset hues. You smiled as Meera took your hand, and together you watched the pines cast long shadows over the quiet waters. You remembered the Rabindrasangeet melody Baba hummed every autumn.",
      eventId: "evt-shillong-2018",
      placeId: "plc-umiam",
      personIds: ["p-meera", "p-baba"],
      author: "Meera (Daughter)",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI",
      duration: "2m 15s",
      voiceMemoryId: "vm-2"
    },
    {
      id: "story-3",
      patientId: "user-asha",
      title: "Preparing Pithe Sweets for Diwali",
      text: "Ravi narrates the story of preparing homemade pithe sweets and setting earthen diyas along the Brahmaputra verandas with fresh parijat jasmine blossoms in the courtyard.",
      eventId: "evt-durga-puja-2021",
      placeId: "plc-guwahati",
      personIds: ["p-ravi"],
      author: "Ravi (Son)",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      duration: "02:18 mins",
      voiceMemoryId: "vm-3"
    }
  ],

  voiceMemories: [
    {
      id: "vm-1",
      patientId: "user-asha",
      title: "Shillong Tea Garden Reminiscence",
      audioUrl: "",
      transcript: "It was a crisp autumn morning in the Khasi hills. The morning mist was drifting slowly over the emerald green tea bushes...",
      storyId: "story-1",
      memoryId: "mem-1",
      duration: "03:40",
      author: "Meera (Daughter)"
    },
    {
      id: "vm-2",
      patientId: "user-asha",
      title: "Baba's Autumn Melodies",
      audioUrl: "",
      transcript: "October 2018 at Umiam Lake. The water reflected copper sunset hues...",
      storyId: "story-2",
      memoryId: "mem-2",
      duration: "02:15",
      author: "Meera (Daughter)"
    },
    {
      id: "vm-3",
      patientId: "user-asha",
      title: "Diwali Courtyard Diyas",
      audioUrl: "",
      transcript: "Ravi narrates the story of preparing homemade pithe sweets and setting earthen diyas along the Brahmaputra verandas...",
      storyId: "story-3",
      memoryId: "mem-7",
      duration: "02:18",
      author: "Ravi (Son)"
    }
  ],

  memoryRelationships: [
    { id: "rel-1", patientId: "user-asha", sourceType: "person", sourceId: "p-meera", relationshipType: "participated_in", targetType: "event", targetId: "evt-shillong-2018" },
    { id: "rel-2", patientId: "user-asha", sourceType: "person", sourceId: "p-priya", relationshipType: "participated_in", targetType: "event", targetId: "evt-shillong-2018" },
    { id: "rel-3", patientId: "user-asha", sourceType: "person", sourceId: "p-priya", relationshipType: "participated_in", targetType: "event", targetId: "evt-convocation-2022" },
    { id: "rel-4", patientId: "user-asha", sourceType: "person", sourceId: "p-meera", relationshipType: "participated_in", targetType: "event", targetId: "evt-durga-puja-2021" },
    { id: "rel-5", patientId: "user-asha", sourceType: "event", sourceId: "evt-shillong-2018", relationshipType: "occurred_at", targetType: "place", targetId: "plc-shillong" },
    { id: "rel-6", patientId: "user-asha", sourceType: "person", sourceId: "p-meera", relationshipType: "associated_with", targetType: "place", targetId: "plc-shillong" },
    { id: "rel-7", patientId: "user-asha", sourceType: "person", sourceId: "p-baba", relationshipType: "associated_with", targetType: "place", targetId: "plc-guwahati" },
    { id: "rel-8", patientId: "user-asha", sourceType: "person", sourceId: "p-meera", relationshipType: "related_to", targetType: "person", targetId: "p-priya" },
    { id: "rel-9", patientId: "user-asha", sourceType: "story", sourceId: "story-1", relationshipType: "describes", targetType: "event", targetId: "evt-shillong-2018" },
    { id: "rel-10", patientId: "user-asha", sourceType: "voice_memory", sourceId: "vm-1", relationshipType: "describes", targetType: "story", targetId: "story-1" },
    { id: "rel-11", patientId: "user-asha", sourceType: "memory", sourceId: "mem-1", relationshipType: "features", targetType: "person", targetId: "p-meera" },
    { id: "rel-12", patientId: "user-asha", sourceType: "memory", sourceId: "mem-1", relationshipType: "features", targetType: "person", targetId: "p-priya" },
    { id: "rel-13", patientId: "user-asha", sourceType: "memory", sourceId: "mem-1", relationshipType: "located_at", targetType: "place", targetId: "plc-shillong" },
    { id: "rel-14", patientId: "user-asha", sourceType: "memory", sourceId: "mem-1", relationshipType: "commemorates", targetType: "event", targetId: "evt-shillong-2018" },
    { id: "rel-15", patientId: "user-asha", sourceType: "memory", sourceId: "mem-2", relationshipType: "located_at", targetType: "place", targetId: "plc-umiam" },
    { id: "rel-16", patientId: "user-asha", sourceType: "memory", sourceId: "mem-2", relationshipType: "features", targetType: "person", targetId: "p-meera" },
    { id: "rel-17", patientId: "user-asha", sourceType: "memory", sourceId: "mem-2", relationshipType: "features", targetType: "person", targetId: "p-baba" },
    { id: "rel-18", patientId: "user-asha", sourceType: "memory", sourceId: "mem-4", relationshipType: "located_at", targetType: "place", targetId: "plc-guwahati" },
    { id: "rel-19", patientId: "user-asha", sourceType: "memory", sourceId: "mem-5", relationshipType: "commemorates", targetType: "event", targetId: "evt-convocation-2022" },
    { id: "rel-20", patientId: "user-asha", sourceType: "memory", sourceId: "mem-6", relationshipType: "commemorates", targetType: "event", targetId: "evt-durga-puja-2021" },
    { id: "rel-21", patientId: "user-asha", sourceType: "memory", sourceId: "mem-7", relationshipType: "features", targetType: "person", targetId: "p-ravi" },
    { id: "rel-22", patientId: "user-asha", sourceType: "memory", sourceId: "mem-7", relationshipType: "located_at", targetType: "place", targetId: "plc-guwahati" }
  ],

  memories: [
    {
      id: "mem-1",
      patientId: "user-asha",
      title: "Tea Garden Morning, Shillong",
      category: "Places",
      type: "spotlight",
      year: "2018",
      date: "October 2018",
      season: "Autumn 2018 • Shillong",
      companions: "With Meera & Granddaughter Priya",
      personIds: ["p-meera", "p-priya"],
      placeId: "plc-shillong",
      eventId: "evt-shillong-2018",
      storyId: "story-1",
      quote: "The fresh mist rising from the emerald slopes of the Khasi hills. We stopped by the wooden tea stall and drank hot spiced chai while Priya laughed at the mountain goats.",
      description: "A serene autumn morning visiting the Khasi tea gardens with Meera and Priya. The air was crisp and scented with fresh ginger and pine.",
      timeOfDay: "6:45 AM Crisp Chill",
      cue: "Ginger Cinnamon Aroma",
      duration: "3m 40s",
      audioTitle: "Playing: Shillong Tea Garden Reminiscence",
      narrationText: "It was a crisp autumn morning in the Khasi hills. The morning mist was drifting slowly over the emerald green tea bushes. You were wearing your favourite warm ochre shawl. We stopped at the wooden stall by the bend, and the vendor gave us two steaming glasses of spiced ginger tea. You held the warm glass in your hands, closed your eyes, and whispered: 'This smells just like our mornings in Guwahati with Baba.'",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d",
      coverPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d",
      tags: ["Khasi Hills", "Tea Garden", "Ginger Chai", "Meera", "Priya"],
      favorite: true,
      important: true,
      createdAt: "2026-01-15T08:00:00.000Z",
      updatedAt: "2026-01-15T08:00:00.000Z"
    },
    {
      id: "mem-2",
      patientId: "user-asha",
      title: "Sunset over Umiam Lake",
      category: "Special Moments",
      type: "editorial",
      year: "2018",
      date: "October 14, 2018",
      season: "October 14, 2018",
      companions: "With Daughter Meera",
      personIds: ["p-meera", "p-baba"],
      placeId: "plc-umiam",
      eventId: "evt-shillong-2018",
      storyId: "story-2",
      quote: "The pine scent was strong and the water was like glass. You remembered the song Baba used to hum whenever autumn arrived.",
      description: "Watching the copper sunset over the quiet waters of Umiam Lake. The air smelled of pine and peaceful waters.",
      timeOfDay: "5:15 PM Golden Sunset",
      cue: "Pine Needles Aroma",
      duration: "2m 15s",
      audioTitle: "Playing: Umiam Sunset Song",
      narrationText: "October 2018 at Umiam Lake. The water reflected copper sunset hues. You smiled as Meera took your hand, and together you watched the pines cast long shadows over the quiet waters.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI",
      coverPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI",
      tags: ["Baba's Song", "Meera", "Autumn Pine", "Umiam"],
      favorite: true,
      important: false,
      createdAt: "2026-01-15T08:00:00.000Z",
      updatedAt: "2026-01-15T08:00:00.000Z"
    },
    {
      id: "mem-3",
      patientId: "user-asha",
      title: "Meera (Daughter)",
      category: "People",
      type: "anchor",
      year: "Present",
      date: "Present Daily",
      companions: "Daughter",
      personIds: ["p-meera"],
      description: "Always brings homemade ginger tea and checks the jasmine garden. Remembers grandmother's handwritten recipe journal.",
      quote: "Meera never leaves without brewing warm ginger water and seeing Asha smile.",
      tags: ["Daughter", "Primary Caregiver", "Family Anchor"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw",
      coverPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw",
      favorite: false,
      important: true,
      createdAt: "2026-01-15T08:00:00.000Z",
      updatedAt: "2026-01-15T08:00:00.000Z"
    },
    {
      id: "mem-4",
      patientId: "user-asha",
      title: "The Old Guwahati Courtyard",
      category: "Places",
      type: "sacred-place",
      year: "Ancestral",
      date: "1975–Present",
      personIds: ["p-baba"],
      placeId: "plc-guwahati",
      location: "Guwahati Old Town, Assam",
      description: "The red brick house with the blooming night jasmine. The sound of monsoon rains drumming rhythmically on the corrugated rooftop.",
      quote: "Monsoons on the veranda with hot tea and Baba reading his poetry journal aloud.",
      tags: ["Guwahati", "Ancestral Home", "Monsoon", "Baba"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      coverPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      favorite: false,
      important: true,
      createdAt: "2026-01-15T08:00:00.000Z",
      updatedAt: "2026-01-15T08:00:00.000Z"
    },
    {
      id: "mem-5",
      patientId: "user-asha",
      title: "Priya's Convocation Day",
      category: "Special Moments",
      type: "moment",
      year: "Winter 2022",
      date: "December 2022",
      personIds: ["p-priya"],
      eventId: "evt-convocation-2022",
      description: "A sunny winter morning in Delhi. Golden medals, yellow marigold garlands, and Priya whispering, 'Dida, this degree is for your courage.'",
      quote: "Golden medals and Priya hugging Dida tight under the university trees.",
      tags: ["Priya", "Convocation", "Delhi", "Proud Moments"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E",
      coverPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E",
      favorite: false,
      important: false,
      createdAt: "2026-01-15T08:00:00.000Z",
      updatedAt: "2026-01-15T08:00:00.000Z"
    },
    {
      id: "mem-6",
      patientId: "user-asha",
      title: "Durga Puja 2021 with Grandchildren",
      category: "Stories",
      type: "story",
      year: "2021",
      date: "October 2021",
      personIds: ["p-meera", "p-priya"],
      eventId: "evt-durga-puja-2021",
      description: "Celebrated with family holding brass lamps and listening to the rhythmic dhak drums. Priya wore her hand-stitched silk saree.",
      quote: "The sound of dhak drums echoing with warm family laughter.",
      tags: ["Durga Puja", "Festival", "Family Gathering", "Kolkata"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5",
      coverPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5",
      favorite: false,
      important: false,
      createdAt: "2026-01-15T08:00:00.000Z",
      updatedAt: "2026-01-15T08:00:00.000Z"
    },
    {
      id: "mem-7",
      patientId: "user-asha",
      title: "Remembering Diwali in Guwahati",
      category: "Voice Notes",
      type: "audio",
      year: "2023",
      date: "November 2023",
      personIds: ["p-ravi"],
      placeId: "plc-guwahati",
      storyId: "story-3",
      voiceMemoryId: "vm-3",
      duration: "02:18 mins",
      languages: "Bilingual (Assamese / English)",
      author: "Ravi (Son)",
      description: "Ravi narrates the story of preparing homemade pithe sweets and setting earthen diyas along the Brahmaputra verandas.",
      quote: "Ravi: 'Ma, do you remember lighting the small clay diyas together on the porch?'",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      coverPhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      tags: ["Voice Narrative", "Ravi (Son)", "Diwali", "Guwahati"],
      favorite: false,
      important: false,
      createdAt: "2026-01-15T08:00:00.000Z",
      updatedAt: "2026-01-15T08:00:00.000Z"
    }
  ],

  // ALL 20 CANONICAL COGNITIVE ACTIVITIES SPECIFIED BY USER
  activities: [
    // 1. REMEMBER
    {
      id: "act-1",
      name: "Memory Match",
      category: "REMEMBER",
      subtitle: "Pairing familiar family faces and cherished keepsake tokens",
      duration: "4 mins",
      comfort: "Serene",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw",
      locationStamp: "Kolkata Veranda & Home Album",
      contextStamp: "Family Portraits Pairing",
      albumRef: "MM-MATCH-01",
      question: "Match the photograph of Meera with her cherished family role:",
      hint: "She visits you every morning and checked your blood pressure today.",
      options: [
        { id: "opt-1a", letter: "A", title: "Meera, your loving daughter", subtitle: "Primary caregiver living in Sector 4", correct: true },
        { id: "opt-1b", letter: "B", title: "Dr. Sen", subtitle: "Your dentist in Guwahati", correct: false },
        { id: "opt-1c", letter: "C", title: "Sunita", subtitle: "Veranda neighbor from Kolkata", correct: false }
      ]
    },
    {
      id: "act-2",
      name: "Personal Memory Recall",
      category: "REMEMBER",
      subtitle: "A familiar walk through the tea gardens of Shillong",
      duration: "5 mins",
      comfort: "Serene",
      difficulty: 1,
      totalSteps: 4,
      currentStep: 2,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4eGyiljLtDN1mv8-shNH3o6kdWjH4fRs9WVMb6mAj3IOXFoO-YOlzUBw034lYelDl7eJfjC5cjaFCXWbNB2sjEYqBNr6_nyqYxGiwQOyo6iaU05Sap25BvO5ME0tVgTy6b19X8UWEHJ9wOhfBuaKMCFENNaY2Dtj7U-0CtVf7SYk2HAQfuLj-pLE7FpzrMNsdvNgAKR1xGT5E2zsC540N3FvvL71BUJkLhgD-0XqgATUGWZ0x1VNv",
      locationStamp: "Ward's Lake & Pine Ridge, Shillong (Autumn 2018)",
      contextStamp: "Family Autumn Trip with Daughter Meera",
      albumRef: "MM-SHL-18",
      question: "Who joined you for hot tea during your 2018 visit to the Shillong pine hills?",
      hint: "She wore a yellow handloom kurta and drove with you from Guwahati by road.",
      options: [
        { id: "meera", letter: "A", title: "Meera, your daughter", subtitle: "Traveled together from Guwahati by road", correct: true },
        { id: "sunita", letter: "B", title: "Sunita, your neighbor", subtitle: "Morning tea companion at home in Kolkata", correct: false },
        { id: "barua", letter: "C", title: "Dr. Barua", subtitle: "Your longtime family physician", correct: false }
      ]
    },
    {
      id: "act-3",
      name: "People & Relationships",
      category: "REMEMBER",
      subtitle: "Connecting family members to their special bonds",
      duration: "5 mins",
      comfort: "Comfortable",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E",
      locationStamp: "Delhi & Guwahati Connection",
      contextStamp: "Granddaughter Bond",
      albumRef: "MM-PPL-03",
      question: "Who whispered 'Dida, this university degree is for your courage'?",
      hint: "Your granddaughter who is calling you today at 4:00 PM.",
      options: [
        { id: "opt-3a", letter: "A", title: "Priya, your granddaughter", subtitle: "Completed her graduation honors in Delhi", correct: true },
        { id: "opt-3b", letter: "B", title: "Ravi, your son", subtitle: "Working in Bangalore", correct: false },
        { id: "opt-3c", letter: "C", title: "Ruma, your sister", subtitle: "Living in Siliguri", correct: false }
      ]
    },
    {
      id: "act-4",
      name: "Photo Story",
      category: "REMEMBER",
      subtitle: "Arranging cherished photographs into a happy storyline",
      duration: "6 mins",
      comfort: "Joyful",
      difficulty: 2,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5",
      locationStamp: "Kolkata Puja Mandap (2021)",
      contextStamp: "Autumn Celebrations",
      albumRef: "MM-STORY-04",
      question: "Which event took place when the grandchildren lit the brass lamps with you?",
      hint: "The grand autumn celebration with traditional dhak drums.",
      options: [
        { id: "opt-4a", letter: "A", title: "Durga Puja evening celebration", subtitle: "Family gathering with hand-stitched saris and sweets", correct: true },
        { id: "opt-4b", letter: "B", title: "New Year picnic at the lake", subtitle: "Outdoor boat ride", correct: false },
        { id: "opt-4c", letter: "C", title: "Sunday morning market walk", subtitle: "Buying fresh ginger and vegetables", correct: false }
      ]
    },
    {
      id: "act-5",
      name: "Memory Reconstruction",
      category: "REMEMBER",
      subtitle: "Assembling keepsake memories of the ancestral courtyard",
      duration: "5 mins",
      comfort: "Serene",
      difficulty: 2,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      locationStamp: "Guwahati Old Town, Assam",
      contextStamp: "Ancestral Home Keepsake",
      albumRef: "MM-RECON-05",
      question: "What flower tree bloomed fragrant white petals in the ancestral courtyard?",
      hint: "Its blossoms fall overnight and perfume the morning veranda.",
      options: [
        { id: "opt-5a", letter: "A", title: "Night Jasmine (Parijat)", subtitle: "Sweet white flowers with delicate orange stems", correct: true },
        { id: "opt-5b", letter: "B", title: "Gulmohar", subtitle: "Bright red summer blooms", correct: false },
        { id: "opt-5c", letter: "C", title: "Bougainvillea", subtitle: "Thorny pink climber", correct: false }
      ]
    },

    // 2. NOTICE
    {
      id: "act-6",
      name: "Attention Hunt",
      category: "NOTICE",
      subtitle: "Gentle inspection of peaceful tea plantation details",
      duration: "4 mins",
      comfort: "Calm",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d",
      locationStamp: "Khasi Hills Tea Estate",
      contextStamp: "Visual Inspection",
      albumRef: "MM-HUNT-06",
      question: "Look closely at the tea stall photograph. What color was Asha's handloom shawl?",
      hint: "A warm earthen harvest shade reflecting morning sunshine.",
      options: [
        { id: "opt-6a", letter: "A", title: "Warm Ochre / Terracotta", subtitle: "Handwoven wool with embroidered border", correct: true },
        { id: "opt-6b", letter: "B", title: "Bright Sky Blue", subtitle: "Light silk scarf", correct: false },
        { id: "opt-6c", letter: "C", title: "Deep Black", subtitle: "Heavy winter coat", correct: false }
      ]
    },
    {
      id: "act-7",
      name: "Familiar Object Recognition",
      category: "NOTICE",
      subtitle: "Recognizing timeless household heirlooms",
      duration: "3 mins",
      comfort: "Comfortable",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5",
      locationStamp: "Living Heirloom Vault",
      contextStamp: "Object Recognition",
      albumRef: "MM-OBJ-07",
      question: "What traditional item is held during evening prayer ceremonies?",
      hint: "It holds mustard oil and a cotton wick to shed warm golden light.",
      options: [
        { id: "opt-7a", letter: "A", title: "Panchpradip (Brass Diya Lamp)", subtitle: "Five-tiered ritual lamp with carved handle", correct: true },
        { id: "opt-7b", letter: "B", title: "Electric Torch", subtitle: "Plastic battery light", correct: false },
        { id: "opt-7c", letter: "C", title: "Glass Lantern", subtitle: "Kerosene storm lantern", correct: false }
      ]
    },
    {
      id: "act-8",
      name: "Sound Recognition",
      category: "NOTICE",
      subtitle: "Gentle audio listening of nature and home sounds",
      duration: "4 mins",
      comfort: "Serene",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      locationStamp: "Assam Monsoon Archives",
      contextStamp: "Acoustic Reminiscence",
      albumRef: "MM-SND-08",
      question: "Which peaceful sound always brought comfort to the Guwahati home in July?",
      hint: "Rhythmic drumming from the clouds onto the tin roof.",
      options: [
        { id: "opt-8a", letter: "A", title: "Monsoon rain drumming softly on the roof", subtitle: "Cool breezes and warm tea indoors", correct: true },
        { id: "opt-8b", letter: "B", title: "Traffic horn noises", subtitle: "City highway sound", correct: false },
        { id: "opt-8c", letter: "C", title: "Airport siren", subtitle: "Mechanical alarm", correct: false }
      ]
    },

    // 3. SOLVE
    {
      id: "act-9",
      name: "Pattern Predictor",
      category: "SOLVE",
      subtitle: "Calming geometric and color rhythms",
      duration: "4 mins",
      comfort: "Gentle",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI",
      locationStamp: "Earthen Textile Loom",
      contextStamp: "Pattern Rhythm",
      albumRef: "MM-PAT-09",
      question: "Look at the sari border colors: Terracotta, Sage, Terracotta, Sage... What comes next?",
      hint: "It is the warm earth pigment used in MindMitra's primary touch buttons.",
      options: [
        { id: "opt-9a", letter: "A", title: "Terracotta (Warm Earthen Red)", subtitle: "Completes the harmonious handloom cadence", correct: true },
        { id: "opt-9b", letter: "B", title: "Neon Purple", subtitle: "Does not belong in the pattern", correct: false },
        { id: "opt-9c", letter: "C", title: "Dark Steel Gray", subtitle: "Industrial shade", correct: false }
      ]
    },
    {
      id: "act-10",
      name: "Object Sorting",
      category: "SOLVE",
      subtitle: "Categorizing everyday items with confidence",
      duration: "5 mins",
      comfort: "Comfortable",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4eGyiljLtDN1mv8-shNH3o6kdWjH4fRs9WVMb6mAj3IOXFoO-YOlzUBw034lYelDl7eJfjC5cjaFCXWbNB2sjEYqBNr6_nyqYxGiwQOyo6iaU05Sap25BvO5ME0tVgTy6b19X8UWEHJ9wOhfBuaKMCFENNaY2Dtj7U-0CtVf7SYk2HAQfuLj-pLE7FpzrMNsdvNgAKR1xGT5E2zsC540N3FvvL71BUJkLhgD-0XqgATUGWZ0x1VNv",
      locationStamp: "Household Harmony",
      contextStamp: "Cognitive Classification",
      albumRef: "MM-SORT-10",
      question: "Where do fresh Tulsi leaves and jasmine blossoms belong?",
      hint: "They grow in terracotta planters under open morning sunshine.",
      options: [
        { id: "opt-10a", letter: "A", title: "The Sunlit Veranda Garden", subtitle: "Where Asha picks fresh leaves every morning", correct: true },
        { id: "opt-10b", letter: "B", title: "The Tool Shed", subtitle: "For hammers and nails", correct: false },
        { id: "opt-10c", letter: "C", title: "The Book Wardrobe", subtitle: "For old college textbooks", correct: false }
      ]
    },

    // 4. SEQUENCE
    {
      id: "act-11",
      name: "Routine Builder",
      category: "SEQUENCE",
      subtitle: "Peaceful sequencing of daily wellness milestones",
      duration: "5 mins",
      comfort: "Serene",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAml05UVx_vC9JEQ-b9kXhvl9yXjSiCIjDjVlbc8-FY-fJbKNCH0vKBcne4z-xAdCZkXxnu1F2X4PlGI7w6nxpwKa3DMArHetAnWgpwSfdNX1wtTzH6pxbK2utg6IE2RXPYcZoMDEpomqhUEKugFrJEQuM3CaNpV5a6-9Zz7qBaMaj7IMG1GwIl-6Y2k9ZZIkOLwdyH3PYa2ArSE2cwC5BpJvETads59mlEOCioSxTUzVmzSmT1D36",
      locationStamp: "Morning Care Routine",
      contextStamp: "Daily Rhythm Cadence",
      albumRef: "MM-ROUT-11",
      question: "What is your peaceful first step after waking up in the morning?",
      hint: "Fresh warm water infused with fragrant green leaves from your veranda.",
      options: [
        { id: "opt-11a", letter: "A", title: "Warm Tulsi tea & gentle hydration", subtitle: "Calming morning hydration at 7:30 AM", correct: true },
        { id: "opt-11b", letter: "B", title: "Evening television news", subtitle: "Done after sunset", correct: false },
        { id: "opt-11c", letter: "C", title: "Bedtime herbal chamomile", subtitle: "Taken before sleeping at 9:30 PM", correct: false }
      ]
    },
    {
      id: "act-12",
      name: "Story Sequence",
      category: "SEQUENCE",
      subtitle: "Reconnecting the steps of an autumn trip",
      duration: "5 mins",
      comfort: "Nostalgic",
      difficulty: 2,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI",
      locationStamp: "Guwahati to Shillong Highway",
      contextStamp: "Episodic Chronology",
      albumRef: "MM-SEQ-12",
      question: "On the trip to Shillong: First we drove past Nongpoh. What came next before sunset?",
      hint: "We stopped by the serene lake surrounded by tall pines.",
      options: [
        { id: "opt-12a", letter: "A", title: "Stopped by Umiam Lake for spiced tea", subtitle: "Watching the copper sunset over the quiet water", correct: true },
        { id: "opt-12b", letter: "B", title: "Boarded an overnight flight", subtitle: "Not part of the road trip", correct: false },
        { id: "opt-12c", letter: "C", title: "Went grocery shopping in Kolkata", subtitle: "Different city entirely", correct: false }
      ]
    },
    {
      id: "act-13",
      name: "Cooking Sequence",
      category: "SEQUENCE",
      subtitle: "Remembering traditional recipes and kitchen steps",
      duration: "5 mins",
      comfort: "Joyful",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4eGyiljLtDN1mv8-shNH3o6kdWjH4fRs9WVMb6mAj3IOXFoO-YOlzUBw034lYelDl7eJfjC5cjaFCXWbNB2sjEYqBNr6_nyqYxGiwQOyo6iaU05Sap25BvO5ME0tVgTy6b19X8UWEHJ9wOhfBuaKMCFENNaY2Dtj7U-0CtVf7SYk2HAQfuLj-pLE7FpzrMNsdvNgAKR1xGT5E2zsC540N3FvvL71BUJkLhgD-0XqgATUGWZ0x1VNv",
      locationStamp: "Family Kitchen Memories",
      contextStamp: "Recipe Recall",
      albumRef: "MM-COOK-13",
      question: "When preparing your special spiced ginger chai, when do you add the crushed fresh ginger?",
      hint: "It infuses into the bubbling water before milk is poured.",
      options: [
        { id: "opt-13a", letter: "A", title: "Simmer in boiling water with cardamom first", subtitle: "Releases rich digestive warmth and aroma", correct: true },
        { id: "opt-13b", letter: "B", title: "Drop into cold milk after drinking", subtitle: "Incorrect kitchen order", correct: false },
        { id: "opt-13c", letter: "C", title: "Sprinkle dry ginger powder on the saucer", subtitle: "Not how tea is made", correct: false }
      ]
    },
    {
      id: "act-14",
      name: "Shopping Memory",
      category: "SEQUENCE",
      subtitle: "Remembering 3 pleasant ingredients from the morning bazaar",
      duration: "4 mins",
      comfort: "Comfortable",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw",
      locationStamp: "Shillong Laitumkhrah Market",
      contextStamp: "Working Memory",
      albumRef: "MM-SHOP-14",
      question: "Meera bought: Fresh ginger, green cardamom, and what local citrus?",
      hint: "Fragrant Assam lemon (Kaji Nemu) with thin smooth rind.",
      options: [
        { id: "opt-14a", letter: "A", title: "Assam lemon (Kaji Nemu)", subtitle: "Freshly picked from the morning farm crate", correct: true },
        { id: "opt-14b", letter: "B", title: "Canned pineapple juice", subtitle: "Packaged drink", correct: false },
        { id: "opt-14c", letter: "C", title: "Dried cranberries", subtitle: "Imported berry", correct: false }
      ]
    },

    // 5. EXPLORE
    {
      id: "act-15",
      name: "Memory Journey",
      category: "EXPLORE",
      subtitle: "Audio-guided visual stroll through misty Pine Hills",
      duration: "6 mins",
      comfort: "Serene",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClDv4_h1kT5eVvkSQga6Rvx_Lq8Djf0RbYSnZ_4bH0pymqnPJI0CUfPH_OFAFRdnb4q5neeF6-KbIdEvRhJ5g_sN16VkrP-D1hSLkhgvsZ4RM30Be8DPJAnRJPztn1eDAULI4iC_C_D2w4wpnH2QXI7Saaq4H5cHwoO0C31v8JgFqDak6oJ0y-WhKYLKUM6Szq4IBQDjT_aZARe-HlDuGRjuWkNlx2ojGX1L99zHGVvZnzma-JNT-l",
      locationStamp: "Shillong Valley & Pine Walk",
      contextStamp: "Scenic Guided Reminiscence",
      albumRef: "MM-JOUR-15",
      question: "As the morning mist cleared over the valley, what birdcall was heard in the pine trees?",
      hint: "A sweet whistling thrush singing in the quiet dawn breeze.",
      options: [
        { id: "opt-15a", letter: "A", title: "Himalayan Whistling Thrush", subtitle: "Singing clear melodic notes in the pines", correct: true },
        { id: "opt-15b", letter: "B", title: "Noisy city seagull", subtitle: "Coastal bird", correct: false },
        { id: "opt-15c", letter: "C", title: "Desert hawk", subtitle: "Arid habitat", correct: false }
      ]
    },
    {
      id: "act-16",
      name: "Place Explorer",
      category: "EXPLORE",
      subtitle: "Visual exploration of the Old Guwahati Courtyard",
      duration: "5 mins",
      comfort: "Serene",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja",
      locationStamp: "Guwahati Old Town Veranda",
      contextStamp: "Ancestral Reminiscence",
      albumRef: "MM-EXPL-16",
      question: "Where did Baba sit every afternoon with his newspaper and brass glasses?",
      hint: "The wooden cane planters chair in the breezy corner of the veranda.",
      options: [
        { id: "opt-16a", letter: "A", title: "The cane planters chair by the parijat tree", subtitle: "Catching the gentle afternoon cross-breeze", correct: true },
        { id: "opt-16b", letter: "B", title: "On the roof parapet", subtitle: "Unsafe location", correct: false },
        { id: "opt-16c", letter: "C", title: "Inside the dark basement", subtitle: "No daylight", correct: false }
      ]
    },
    {
      id: "act-17",
      name: "Life Simulation",
      category: "EXPLORE",
      subtitle: "Gentle choices for an ideal peaceful day",
      duration: "4 mins",
      comfort: "Comfortable",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d",
      locationStamp: "Daily Comfort Decisions",
      contextStamp: "Autonomy & Dignity",
      albumRef: "MM-SIM-17",
      question: "It is 4:30 PM and the sun is gentle. Would you like to sit by the window with warm tea or listen to Baba's song?",
      hint: "Both choices are wonderful and bring peace.",
      options: [
        { id: "opt-17a", letter: "A", title: "Sit by the sunlit window with warm ginger tea", subtitle: "Enjoying the garden view and quiet warmth", correct: true },
        { id: "opt-17b", letter: "B", title: "Listen to Baba's favourite autumn song", subtitle: "Gentle reminiscence with SmritiAI", correct: true },
        { id: "opt-17c", letter: "C", title: "Rest comfortably with eyes closed for 15 minutes", subtitle: "Recharging your peaceful afternoon energy", correct: true }
      ]
    },

    // 6. CONNECT
    {
      id: "act-18",
      name: "Voice Recall",
      category: "CONNECT",
      subtitle: "Listening to loved ones' audio notes and recognizing them",
      duration: "4 mins",
      comfort: "Joyful",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSLR5wyHeTfoTjv0tj6tFuVSyYKjKmbJP5zB53DJQR-4IBMTC3zYl0ny63cGt7r5T5J_JjaP_OFqxrIVxT0O_QgBexnBV9uXlln1r8nXiDhW9xpSBbfXcyPc1Bbo7UV5103z5ityhT0tkeuUoJIpAZ7KpH7mdDPACAfIRgWxrRANznpjH6UuHAChacb_unZjtGsZBmyHgDgXLV-5VrcFXcJ3Wx3ofjTO0h76LoMY86BmaWy3-ACBVY",
      locationStamp: "Family Voice Vault",
      contextStamp: "Auditory Connection",
      albumRef: "MM-VOICE-18",
      question: "Whose voice says: 'Ma, how are the jasmine flowers doing this week?'",
      hint: "Your son who called you from Bangalore.",
      options: [
        { id: "opt-18a", letter: "A", title: "Ravi, your son", subtitle: "Speaking warmly from Bangalore", correct: true },
        { id: "opt-18b", letter: "B", title: "Bank teller", subtitle: "Stranger", correct: false },
        { id: "opt-18c", letter: "C", title: "Bus conductor", subtitle: "Stranger", correct: false }
      ]
    },
    {
      id: "act-19",
      name: "Festival Memory",
      category: "CONNECT",
      subtitle: "Reviving joyful memories of Diwali and Durga Puja",
      duration: "5 mins",
      comfort: "Warm",
      difficulty: 1,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5",
      locationStamp: "Brahmaputra Veranda, Assam",
      contextStamp: "Cultural Heritage",
      albumRef: "MM-FEST-19",
      question: "What sweet treat did you and the children prepare for Diwali evening?",
      hint: "Traditional rice flour and jaggery pithe dumplings filled with coconut.",
      options: [
        { id: "opt-19a", letter: "A", title: "Homemade coconut pithe sweets", subtitle: "Steamed sweet dumplings with cardamom jaggery", correct: true },
        { id: "opt-19b", letter: "B", title: "French potato fries", subtitle: "Western fast food", correct: false },
        { id: "opt-19c", letter: "C", title: "Store bought cola soda", subtitle: "Fizzy drink", correct: false }
      ]
    },
    {
      id: "act-20",
      name: "Family Memory Mission",
      category: "CONNECT",
      subtitle: "A collaborative story puzzle connecting generations",
      duration: "6 mins",
      comfort: "Loving",
      difficulty: 2,
      totalSteps: 3,
      currentStep: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E",
      locationStamp: "Delhi & Shillong Family Bridge",
      contextStamp: "Cross-generational Bonding",
      albumRef: "MM-MISS-20",
      question: "What special art project is granddaughter Priya bringing to show you during her visit?",
      hint: "A painting of your ancestral Assam garden with the night jasmine blooms.",
      options: [
        { id: "opt-20a", letter: "A", title: "Watercolor painting of the Guwahati Courtyard", subtitle: "Painted with love from your childhood stories", correct: true },
        { id: "opt-20b", letter: "B", title: "Math exam sheet", subtitle: "School test paper", correct: false },
        { id: "opt-20c", letter: "C", title: "Computer code printout", subtitle: "Technical document", correct: false }
      ]
    }
  ],

  // DAILY CARE & ROUTINES / REMINDERS (Configured by Caregiver)
  routines: [
    {
      id: "rtn-1",
      patientId: "user-asha",
      title: "Morning Hydration & Tulsi Tea",
      category: "hydration",
      type: "hydration",
      description: "Warm water infused with fresh Tulsi leaves from veranda.",
      notes: "Warm water infused with fresh Tulsi leaves from veranda.",
      time: "7:30 AM",
      recurrence: "daily",
      enabled: true,
      status: "completed",
      completed: true,
      completedAt: "7:32 AM",
      icon: "water_drop",
      createdBy: "Meera (Caregiver)"
    },
    {
      id: "rtn-2",
      patientId: "user-asha",
      title: "Morning Prescription Care",
      category: "medicine",
      type: "medicine",
      description: "Blood pressure (Amlodipine 5mg) & Vitamin D3 • Arranged by Meera",
      notes: "Blood pressure (Amlodipine 5mg) & Vitamin D3 • Arranged by Meera",
      time: "9:00 AM",
      recurrence: "daily",
      enabled: true,
      status: "completed",
      completed: true,
      completedAt: "9:14 AM",
      icon: "medication",
      createdBy: "Meera (Caregiver)"
    },
    {
      id: "rtn-3",
      patientId: "user-asha",
      title: "Personal Memory Recall",
      category: "activity",
      type: "activity",
      description: "Looking back at childhood festive songs & Shillong walk • 5 min",
      notes: "Looking back at childhood festive songs & Shillong walk • 5 min",
      time: "11:00 AM",
      recurrence: "daily",
      enabled: true,
      status: "pending",
      completed: false,
      statusBadge: "Due Soon",
      icon: "history_edu",
      createdBy: "Meera (Caregiver)"
    },
    {
      id: "rtn-4",
      patientId: "user-asha",
      title: "Afternoon Hydration",
      category: "hydration",
      type: "hydration",
      description: "Fresh water logged on Home Unit (350ml)",
      notes: "Fresh water logged on Home Unit (350ml)",
      time: "2:30 PM",
      recurrence: "daily",
      enabled: true,
      status: "pending",
      completed: false,
      statusBadge: "Due 2:30 PM",
      icon: "water_drop",
      createdBy: "Meera (Caregiver)"
    },
    {
      id: "rtn-5",
      patientId: "user-asha",
      title: "Family Call with Priya (Granddaughter)",
      category: "appointment",
      type: "appointment",
      description: "Priya wants to show her new art project from Bangalore.",
      notes: "Priya wants to show her new art project from Bangalore.",
      time: "4:00 PM",
      recurrence: "daily",
      enabled: true,
      status: "pending",
      completed: false,
      statusBadge: "Upcoming",
      icon: "video_call",
      createdBy: "Meera (Caregiver)"
    },
    {
      id: "rtn-doc-1",
      patientId: "user-asha",
      doctorId: "user-dr-sharma",
      doctorName: "Dr. Ananya Sharma",
      clinic: "Shillong Medical Centre",
      title: "Doctor Review with Dr. Ananya Sharma",
      category: "appointment",
      type: "appointment",
      description: "Routine neurological and cognitive wellness follow-up consultation.",
      notes: "Routine neurological and cognitive wellness follow-up consultation.",
      date: "10 September 2026",
      time: "11:00 AM",
      recurrence: "once",
      enabled: true,
      status: "pending",
      completed: false,
      statusBadge: "Upcoming",
      icon: "medical_services",
      createdBy: "Meera (Caregiver)"
    },
    {
      id: "rtn-6",
      patientId: "user-asha",
      title: "Evening Prescription Care",
      category: "medicine",
      type: "medicine",
      description: "Post-dinner dosage (Doctor approved schedule)",
      notes: "Post-dinner dosage (Doctor approved schedule)",
      time: "8:00 PM",
      recurrence: "daily",
      enabled: true,
      status: "pending",
      completed: false,
      statusBadge: "Scheduled",
      icon: "medication",
      createdBy: "Meera (Caregiver)"
    }
  ],

  reminderOccurrences: [
    {
      id: "occ-1",
      reminderId: "rtn-1",
      patientId: "user-asha",
      scheduledTime: "7:30 AM",
      actionTime: "7:32 AM",
      status: "completed"
    },
    {
      id: "occ-2",
      reminderId: "rtn-2",
      patientId: "user-asha",
      scheduledTime: "9:00 AM",
      actionTime: "9:14 AM",
      status: "completed"
    }
  ],

  emergencyContacts: [
    {
      id: "ec-1",
      name: "National Emergency Response 112",
      relation: "Public Emergency",
      phone: "112",
      badge: "Unified Response (Police, Fire, Medical)",
      priority: 1
    },
    {
      id: "ec-2",
      name: "Meera (Daughter)",
      relation: "Primary Caregiver",
      phone: "+91 98450 21345",
      badge: "Home Safe Zone (3 mins away)",
      priority: 2
    },
    {
      id: "ec-3",
      name: "Ravi (Son)",
      relation: "Secondary Contact",
      phone: "+91 99000 78219",
      badge: "Remote Notification Dispatch",
      priority: 3
    }
  ],

  sosEvents: [
    {
      id: "sos-log-1",
      timestamp: "Yesterday, 4:15 PM",
      title: "Test Button Press",
      status: "Cancelled by User",
      notes: "Asha Devi tested the safety button with Meera present."
    },
    {
      id: "sos-log-2",
      timestamp: "Oct 24, 11:20 PM",
      title: "Night Care Call",
      status: "Call Connected",
      notes: "Connected directly to Meera's mobile line."
    }
  ],

  caregiverLogs: [
    { id: "log-1", time: "9:14 AM Today", text: "Morning medicine confirmed on tablet (Amlodipine 5mg)." },
    { id: "log-2", time: "10:30 AM Today", text: "Morning Hydration (350ml infused water logged)." },
    { id: "log-3", time: "11:20 AM Today", text: "Story Sequence cognitive session completed with SmritiAI audio aid." },
    { id: "log-4", time: "Yesterday, 5:00 PM", text: "Meera in-person check-in: Asha engaged warmly with veranda jasmine." }
  ],

  activitySessions: [
    {
      id: "sess-01",
      activityId: "act-2",
      activityName: "Personal Memory Recall",
      category: "REMEMBER",
      accuracy: 100,
      completionTimeSec: 180,
      attempts: 4,
      hintsUsed: 1,
      skipped: false,
      repeatedErrors: 0,
      difficultyLevel: 1,
      patientId: "user-asha",
      assistanceLevel: "Gentle Guidance",
      engagement: "High Focus",
      timestamp: "11:20 AM Today"
    }
  ],

  activityResults: [
    {
      id: "res-01",
      activityId: "act-2",
      patientId: "user-asha",
      sessionId: "sess-01",
      completedAt: new Date().toISOString(),
      score: 100,
      accuracy: 100,
      mistakes: 0,
      hintsUsed: 1,
      duration: 180,
      difficulty: 1,
      status: "completed"
    }
  ],

  settings: {
    fontSize: "medium", // small, medium, large
    speechRate: 0.88,
    highContrast: false,
    language: "en",
    offlineSyncStatus: "Ready & Synchronized",
    lastSyncTime: "Just now",
    geofenceRadiusMeters: 50
  }
};
