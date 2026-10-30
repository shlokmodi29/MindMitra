// Canonical Data Model for MindMitra (Asha Devi Profile)
export const initialData = {
  profile: {
    name: "Asha Devi",
    role: "Elder Member",
    age: 72,
    location: "Assam / Shillong morning",
    safeZone: "Sector 4 Care Unit, Shillong",
    weather: "22°C • Calm & Breezy",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0YAy95YXoJS_5vZSXW6X-PnJg1OsTqHJE2auKWrD5E7ybjkztRBBIbPZq3y0AoaM-Eb7-2Qx61e_xOx0bClvELv1MtWm0Z7VfdKvssQV7JArcPSFqwheQMajYjLn1WtA7dzsP7DkKjOMqz60OC8iteQ13hCjAL-3WZhbWP9JoryUyuNiYnvwio5McweNRZW-WZd1RGWNj0z1B2xPhZHGMqCFaED7B18VQpnsX4l16dCIuTMDLx3oi",
    lastSync: "Just now",
    deviceStatus: "Tablet Active at Home (Sector 4 Unit)",
    emergencyAddress: "House 14, Sector 4, Near Pine Mount, Shillong"
  },

  familyCircle: [
    {
      id: "meera",
      name: "Meera",
      relation: "Daughter",
      tag: "Primary Caregiver",
      phone: "+91 98450 21345",
      proximity: "3 mins away • Home Safe Zone",
      languages: "Hindi & Assamese",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw",
      lastContact: "Visited yesterday at 5:00 PM"
    },
    {
      id: "ravi",
      name: "Ravi",
      relation: "Son",
      tag: "Secondary Contact",
      phone: "+91 99000 78219",
      proximity: "Bangalore, Karnataka (Remote Sync)",
      languages: "English & Hindi",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSLR5wyHeTfoTjv0tj6tFuVSyYKjKmbJP5zB53DJQR-4IBMTC3zYl0ny63cGt7r5T5J_JjaP_OFqxrIVxT0O_QgBexnBV9uXlln1r8nXiDhW9xpSBbfXcyPc1Bbo7UV5103z5ityhT0tkeuUoJIpAZ7KpH7mdDPACAfIRgWxrRANznpjH6UuHAChacb_unZjtGsZBmyHgDgXLV-5VrcFXcJ3Wx3ofjTO0h76LoMY86BmaWy3-ACBVY",
      lastContact: "Voice note shared 3 days ago"
    },
    {
      id: "priya",
      name: "Priya",
      relation: "Granddaughter",
      tag: "Family Member",
      phone: "+91 98200 44123",
      proximity: "Delhi (University)",
      languages: "English & Hindi",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E",
      lastContact: "Video call scheduled today 4:00 PM"
    },
    {
      id: "dr-barua",
      name: "Dr. Barua",
      relation: "Consultant Physician",
      tag: "Care Consultant",
      phone: "+91 94350 11982",
      proximity: "Pine Ridge Clinic, Shillong",
      languages: "English, Assamese, Bengali",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAml05UVx_vC9JEQ-b9kXhvl9yXjSiCIjDjVlbc8-FY-fJbKNCH0vKBcne4z-xAdCZkXxnu1F2X4PlGI7w6nxpwKa3DMArHetAnWgpwSfdNX1wtTzH6pxbK2utg6IE2RXPYcZoMDEpomqhUEKugFrJEQuM3CaNpV5a6-9Zz7qBaMaj7IMG1GwIl-6Y2k9ZZIkOLwdyH3PYa2ArSE2cwC5BpJvETads59mlEOCioSxTUzVmzSmT1D36",
      lastContact: "Prescription reviewed on Monday"
    }
  ],

  routines: [
    {
      id: "routine-1",
      title: "Morning Hydration & Tulsi Tea",
      description: "Warm water infused with fresh Tulsi leaves from veranda.",
      time: "7:30 AM",
      category: "wellness",
      completed: true,
      completedAt: "7:32 AM",
      icon: "check_circle"
    },
    {
      id: "routine-2",
      title: "Morning Prescription Care",
      description: "Blood pressure & Vitamin D3 • Arranged by Meera",
      time: "9:00 AM",
      category: "medication",
      completed: true,
      completedAt: "9:14 AM",
      icon: "check_circle"
    },
    {
      id: "routine-3",
      title: "Personal Memory Recall",
      description: "Looking back at childhood festive songs • 6 min",
      time: "11:00 AM",
      category: "cognitive",
      completed: false,
      statusBadge: "Due Soon",
      icon: "history_edu"
    },
    {
      id: "routine-4",
      title: "Afternoon Hydration",
      description: "Reminder prompt armed on Home Unit (350ml)",
      time: "2:30 PM",
      category: "wellness",
      completed: false,
      statusBadge: "Due 2:30 PM",
      icon: "schedule"
    },
    {
      id: "routine-5",
      title: "Family Call with Priya (Granddaughter)",
      description: "Priya wants to show her new art project from Bangalore.",
      time: "4:00 PM",
      category: "social",
      completed: false,
      statusBadge: "Upcoming",
      icon: "video_call"
    },
    {
      id: "routine-6",
      title: "Evening Medicine Routine",
      description: "Post-dinner dosage (Doctor approved schedule)",
      time: "8:00 PM",
      category: "medication",
      completed: false,
      statusBadge: "Scheduled",
      icon: "medication"
    }
  ],

  memories: [
    {
      id: "mem-1",
      title: "Tea Garden Morning, Shillong",
      category: "Places",
      type: "spotlight",
      year: "2018",
      season: "Autumn 2018 • Shillong",
      companions: "With Meera & Granddaughter Priya",
      quote: "The fresh mist rising from the emerald slopes of the Khasi hills. We stopped by the wooden tea stall and drank hot spiced chai while Priya laughed at the mountain goats.",
      timeOfDay: "6:45 AM Crisp Chill",
      cue: "Ginger Cinnamon Aroma",
      duration: "3m 40s",
      audioTitle: "Playing: Shillong Tea Garden Reminiscence",
      narrationText: "It was a crisp autumn morning in the Khasi hills. The morning mist was drifting slowly over the emerald green tea bushes. You were wearing your favourite warm ochre shawl. We stopped at the wooden stall by the bend, and the vendor gave us two steaming glasses of spiced ginger tea. You held the warm glass in your hands, closed your eyes, and whispered: 'This smells just like our mornings in Guwahati with Baba.'",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9quruDM6l-lR-7W24pE_W0NX2mY7MEiDYMl7ql2sZ_QRQ7D-NH9U4cKzj7UJEsP6HAz9UYIXzvWUwLSf9435pp57UHZoEfZpAQ5tcAOs3WdTs3FbMByQj6sgTUZHHPZ-FJGZaZb1Pq8fZYr8634oUGltshBb5QKGGDMKbefz5AzrIxUJXVoDWm-io97RbcNo_e9PL-KCRfocNbcDNjEieNZn-WLyl4RytmqvYfXuB7IpvmQvpZS8d"
    },
    {
      id: "mem-2",
      title: "Sunset over Umiam Lake",
      category: "Special Moments",
      type: "editorial",
      year: "2018",
      season: "October 14, 2018",
      companions: "With Daughter Meera",
      quote: "The pine scent was strong and the water was like glass. You remembered the song Baba used to hum whenever autumn arrived.",
      tags: ["Baba's Song", "Meera", "Autumn Pine"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHcmF5BkQMk-RB20BsWMkAfiaSWVApXU_jCVHUbxnO4XlzbzNNJTxCxWN0Ho9mfPYMs8LE-6unWjvdCMBCDhXzrS-K7A8DLMlrsEOYNDO1v9BX6qicZvvZjCZNfN4ZER3BLnoMO5Y4n_UJIYfmWqh62SKMaNKnQXebZ-UpvSlC365I3Z5esTTMFelJ_q2BaiU-31b3xN0SehMEzDn3QV-6_FECV5eRcGwy2iINXZTjryDBIVqzZI",
      narrationText: "October 2018 at Umiam Lake. The water reflected copper sunset hues. You smiled as Meera took your hand, and together you watched the pines cast long shadows over the quiet waters."
    },
    {
      id: "mem-3",
      title: "Meera (Daughter)",
      category: "People",
      type: "anchor",
      year: "Present",
      companions: "Daughter",
      description: "Always brings homemade ginger tea and checks the jasmine garden. Remembers grandmother's handwritten recipe journal.",
      tags: ["3 Connected Places", "14 Memories"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFsUQsFG7Aocu9cogI7HmvsTS7dOsniLo5kT7I2KJlwpBTQPzweuYKfVqBpuJ8A9WgaTdpr5ziiSPBONlpnprntpWoJS38_RpMX-wHiXu7eZjUDc4c1GEcpblsSqqhzM1FhuYW0fxGcr9wdKVgCo2mHh5SLP2_W9o5MIQ8GdY0hjG-oKCA1NAfNUopC8ilS782KxJutPUcaHybWCYR6qJODvpUKKgp-Nu3Nc3G21nmtNxr3EY3hPGw"
    },
    {
      id: "mem-4",
      title: "The Old Guwahati Courtyard",
      category: "Places",
      type: "sacred-place",
      year: "Ancestral",
      location: "Guwahati Old Town, Assam",
      description: "The red brick house with the blooming night jasmine. The sound of monsoon rains drumming rhythmically on the corrugated rooftop.",
      tags: ["8 linked memories", "2 recorded stories"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC22wvw0W6QPHS8HfYaEOvuhq3Z64L-LQ6C1Z6eABAuUst6_l0OsfnmESMEWZ3fOFlMGTNXKIDrEe2homASLswMtPqjKeAK5WTQyyneikgGu2NA2GA2tua6IzQ06V31A6_ZE6MzpmFcc5CpWrWaM9xsVn4D61l2PH_TeJ8vhbEWPYhzZSPIbcf2-cSpbse6Gx0UOAqgXHXc3yJULQweZ3c2gM2IQY8iHR1kqA2dh4WS1M6_uoNat6Ja"
    },
    {
      id: "mem-5",
      title: "Priya's Convocation Day",
      category: "Special Moments",
      type: "moment",
      year: "Winter 2022",
      description: "A sunny winter morning in Delhi. Golden medals, yellow marigold garlands, and Priya whispering, 'Dida, this degree is for your courage.'",
      tags: ["5 Photos", "Audio Clip"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB18GOO50aNeIlri76fwryQuEtY2N9ji_Al90UKxFEVSRIRR8_rHr2eOvFWPeIrYGz2IR4aghat-FOV8AYS7K2mcpEWDnFMiEbfEUNMP-_ejqSihdmVkl7j11R46Pf3YnXig-LKAq13VJupcbaJX68YpjU9_ivJ75F6vNzZOT0SGH9RXdWixuvFdXZOfJNFxgN1zT2z_McN5YTFRXaXW8A0tV8BwqOo47BdWucEF_PmUmxAOIJ8Jf-E"
    },
    {
      id: "mem-6",
      title: "Durga Puja 2021 with Grandchildren",
      category: "Stories",
      type: "story",
      year: "2021",
      description: "Uploaded with 3 custom conversational prompts about the Dhak drums and Pia's hand-stitched sari.",
      tags: ["Meera (Daughter)", "Yesterday"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT8_4ySDVkudWjVdrx95ANqeipj8foA9zXh_t0TzofsO37yIYeRBco-LPW3itV6rxzPk8R-_mVUO8D2HwTDZdJ09Jfn8_1VSWN4GLLvbFKVKK7P-pONdgbqyn-ylzcaMl6MokfZDOy2RT82oQTPHZoXGnds9-Ks-M-ji3KBGVCu6WoEwnuRwZqqcCfeLheOhZwNJGTBsnssvVuB2nXhYqhfHayUFcBz715cL2gNrbyNffapMAUG7H5"
    },
    {
      id: "mem-7",
      title: "Remembering Diwali in Guwahati",
      category: "Voice Notes",
      type: "audio",
      year: "2023",
      duration: "02:18 mins",
      languages: "Bilingual (Assamese / English)",
      author: "Ravi (Son)",
      description: "Ravi narrates the story of preparing homemade pithe sweets and setting earthen diyas along the Brahmaputra verandas.",
      tags: ["Voice Narrative", "Ravi (Son)"]
    }
  ],

  activities: {
    activeActivity: {
      id: "activity-shillong-recollection",
      title: "Personal Memory Recall",
      category: "REMEMBER",
      subtitle: "A familiar walk through the tea gardens of Shillong",
      totalSteps: 4,
      currentStep: 2,
      pace: "5 mins • Gentle Pace",
      locationStamp: "Ward's Lake & Pine Ridge, Shillong (Autumn 2018)",
      contextStamp: "Family Autumn Trip with Daughter Meera",
      albumRef: "MM-SHL-18",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4eGyiljLtDN1mv8-shNH3o6kdWjH4fRs9WVMb6mAj3IOXFoO-YOlzUBw034lYelDl7eJfjC5cjaFCXWbNB2sjEYqBNr6_nyqYxGiwQOyo6iaU05Sap25BvO5ME0tVgTy6b19X8UWEHJ9wOhfBuaKMCFENNaY2Dtj7U-0CtVf7SYk2HAQfuLj-pLE7FpzrMNsdvNgAKR1xGT5E2zsC540N3FvvL71BUJkLhgD-0XqgATUGWZ0x1VNv",
      question: "Who joined you for hot tea during your 2018 visit to the Shillong pine hills?",
      hint: "She wore a yellow handloom kurta and drove with you from Guwahati by car.",
      options: [
        {
          id: "meera",
          letter: "A",
          title: "Meera, your daughter",
          subtitle: "Traveled together from Guwahati by road",
          correct: true
        },
        {
          id: "sunita",
          letter: "B",
          title: "Sunita, your neighbor",
          subtitle: "Morning tea companion at home in Kolkata",
          correct: false
        },
        {
          id: "barua",
          letter: "C",
          title: "Dr. Barua",
          subtitle: "Your longtime family physician",
          correct: false
        }
      ]
    },
    catalog: [
      {
        id: "act-1",
        title: "Personal Memory Recall",
        category: "Recall",
        duration: "5 mins",
        comfort: "Serene",
        status: "In Progress",
        completedToday: false
      },
      {
        id: "act-2",
        title: "Family Faces & Names",
        category: "Recall",
        duration: "4 mins",
        comfort: "Comfortable",
        status: "Available",
        completedToday: false
      },
      {
        id: "act-3",
        title: "Song Lyric Continuation",
        category: "Music & Melody",
        duration: "6 mins",
        comfort: "Joyful",
        status: "Available",
        completedToday: false
      },
      {
        id: "act-4",
        title: "Kitchen Recipe Sequence",
        category: "Story Sequence",
        duration: "5 mins",
        comfort: "Nostalgic",
        status: "Completed",
        completedToday: true
      },
      {
        id: "act-5",
        title: "Assam River Word Association",
        category: "Word Association",
        duration: "4 mins",
        comfort: "Calm",
        status: "Available",
        completedToday: false
      }
    ]
  },

  caregiverInsights: {
    todayRhythmDone: 4,
    todayRhythmTotal: 5,
    cognitiveSessionsDone: 1,
    cognitiveRhythmRate: "92% engagement rhythm",
    remindersRemaining: 2,
    syncTimestamp: "8m ago",
    latestObservation: {
      title: "Consistency Alert: Shillong 2018 Recall",
      time: "09:42 AM Today",
      text: "Asha demonstrated strong engagement with visual cues from the 2018 Shillong family album this morning. Response timing was relaxed and steady (avg 4.2s vs 6.1s previous week avg).",
      metrics: {
        latency: "4.2s (-1.9s)",
        warmth: "High",
        fatigue: "Minimal"
      },
      quote: "When shown the photograph of Elephant Falls, Asha unprompted mentioned her granddaughter Pia’s green cardigan."
    },
    logs: [
      { id: "log-1", time: "9:14 AM", text: "Morning medicine confirmed on tablet." },
      { id: "log-2", time: "10:30 AM", text: "Morning Hydration (350ml infused water logged)." },
      { id: "log-3", time: "11:20 AM", text: "Story Sequence cognitive session completed with SmritiAI audio aid." }
    ]
  }
};
