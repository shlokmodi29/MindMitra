// Emergency Help & Safety Services with Real Browser Geolocation & Telephony Routing
// MindMitra Part 10 — Emergency SOS & Caregiver Contacts
import { store } from '../state/store.js';

export const CALL_STATES = {
  HELP_READY: 'emergency_help',
  CONFIRM_112: 'confirm_112',
  CONFIRM_CAREGIVER: 'confirm_caregiver',
  CALLING: 'calling',
  CALL_INITIATED: 'call_initiated',
  CALL_UNAVAILABLE: 'call_unavailable',
  CALL_FAILED: 'call_failed',
  CANCELLED: 'cancelled'
};

export const LOCATION_STATES = {
  AVAILABLE: 'available',
  PERMISSION_REQUIRED: 'permission_required',
  UNAVAILABLE: 'unavailable',
  DENIED: 'permission_denied',
  ERROR: 'error'
};

export class EmergencyService {
  constructor() {
    this.fallbackCoordinates = {
      lat: 25.5788,
      lng: 91.8933,
      accuracyMeters: 10,
      zone: "Sector 4 Care Unit, Shillong",
      address: "House 14, Sector 4, Near Pine Mount, Shillong"
    };
    this.liveCoordinates = null;
    this.locationState = LOCATION_STATES.PERMISSION_REQUIRED;
    this.activeCallState = CALL_STATES.HELP_READY;
    this.telephonyOverride = null; // Can force telephony available/unavailable for testing
  }

  isTelephonySupported() {
    if (this.telephonyOverride !== null) {
      return this.telephonyOverride;
    }
    return true;
  }

  setTelephonySupported(supported) {
    this.telephonyOverride = Boolean(supported);
  }

  getLocationState() {
    return this.locationState || LOCATION_STATES.AVAILABLE;
  }

  requestLiveLocation() {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        this.locationState = LOCATION_STATES.UNAVAILABLE;
        store.recordEmergencyEvent({
          action: 'location_permission_requested',
          status: 'unavailable',
          details: 'Geolocation not supported by device'
        });
        resolve({
          status: LOCATION_STATES.UNAVAILABLE,
          message: 'Geolocation is not supported by this device or browser.',
          coords: this.fallbackCoordinates
        });
        return;
      }

      store.recordEmergencyEvent({
        action: 'location_permission_requested',
        status: 'pending',
        details: 'Requested geolocation access from browser'
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationState = LOCATION_STATES.AVAILABLE;
          this.liveCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracyMeters: Math.round(position.coords.accuracy),
            zone: "Live GPS Position",
            address: "House 14, Sector 4, Near Pine Mount, Shillong"
          };
          store.recordEmergencyEvent({
            action: 'location_permission_granted',
            status: 'available',
            details: `Accurate to within ${this.liveCoordinates.accuracyMeters}m`
          });
          resolve({
            status: LOCATION_STATES.AVAILABLE,
            message: `Accurate within ${this.liveCoordinates.accuracyMeters}m.`,
            coords: this.liveCoordinates
          });
        },
        (error) => {
          if (error.code === 1) { // PERMISSION_DENIED
            this.locationState = LOCATION_STATES.DENIED;
            store.recordEmergencyEvent({
              action: 'location_permission_denied',
              status: 'denied',
              details: 'User declined geolocation access'
            });
            resolve({
              status: LOCATION_STATES.DENIED,
              message: 'Location access is turned off. Using registered home care address.',
              coords: this.fallbackCoordinates
            });
          } else {
            this.locationState = LOCATION_STATES.UNAVAILABLE;
            store.recordEmergencyEvent({
              action: 'location_permission_error',
              status: 'unavailable',
              details: 'GPS signal timeout or error'
            });
            resolve({
              status: LOCATION_STATES.UNAVAILABLE,
              message: 'Location currently unavailable. Using registered home safe zone.',
              coords: this.fallbackCoordinates
            });
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }

  shareLocationWithCircle() {
    return this.requestLiveLocation().then((locResult) => {
      const activeCoords = locResult.coords || this.fallbackCoordinates;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      store.recordEmergencyEvent({
        action: 'location_share_completed',
        status: locResult.status === LOCATION_STATES.AVAILABLE ? 'live_gps' : 'home_address',
        details: `Shared with Care Circle. Note: Location has NOT been sent to emergency dispatch.`
      });

      return {
        success: true,
        locationStatus: locResult.status,
        statusMessage: locResult.message,
        recipients: ["Meera (Daughter)", "Ravi (Son)"],
        timestamp,
        coordinates: activeCoords,
        disclaimer: "Your location is available to MindMitra and your caregivers, but it has not been sent to an emergency service."
      };
    });
  }

  shareLocationWithCaregiver(contactId, confirmed = false) {
    const patientId = store.getCurrentPatientId();
    const contacts = store.getEmergencyContactsForPatient(patientId);
    const contact = contacts.find(c => c.id === contactId) || contacts[0];

    if (!contact) {
      return Promise.reject(new Error('Caregiver contact not found'));
    }

    if (!confirmed) {
      return Promise.resolve({
        status: 'confirmation_required',
        contact,
        message: `Share your location with ${contact.name}?`
      });
    }

    store.recordEmergencyEvent({
      action: 'location_share_requested',
      status: 'pending',
      details: `Request to share location with ${contact.name}`
    });

    return this.requestLiveLocation().then((locResult) => {
      const activeCoords = locResult.coords || this.fallbackCoordinates;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      store.recordEmergencyEvent({
        action: 'location_share_completed',
        status: 'success',
        details: `Shared with ${contact.name}. Status: ${locResult.status}`
      });

      return {
        success: true,
        status: 'location_share_completed',
        contact,
        locationStatus: locResult.status,
        statusMessage: locResult.message,
        timestamp,
        coordinates: activeCoords,
        disclaimer: "Your location is available to MindMitra and your caregiver, but it has not been sent to an emergency service."
      };
    }).catch(err => {
      store.recordEmergencyEvent({
        action: 'location_share_failed',
        status: 'failed',
        details: err.message
      });
      return {
        success: false,
        status: 'location_share_failed',
        message: 'Could not share location at this moment.'
      };
    });
  }

  requestCall112(confirmed = false) {
    if (!confirmed) {
      this.activeCallState = CALL_STATES.CONFIRM_112;
      return {
        status: CALL_STATES.CONFIRM_112,
        number: '112',
        title: 'Call 112?',
        description: "This will open your phone's emergency call function.",
        requiresConfirmation: true
      };
    }

    store.recordEmergencyEvent({
      action: 'call_112_requested',
      status: 'confirmed',
      details: 'Elder confirmed 112 emergency call'
    });

    return this.initiateCall('112', 'Emergency 112');
  }

  requestCaregiverCall(contactId, confirmed = false) {
    const patientId = store.getCurrentPatientId();
    const contacts = store.getEmergencyContactsForPatient(patientId);
    const contact = contacts.find(c => c.id === contactId);

    if (!contact) {
      return {
        status: CALL_STATES.CALL_FAILED,
        message: 'Contact not found'
      };
    }

    if (!confirmed) {
      this.activeCallState = CALL_STATES.CONFIRM_CAREGIVER;
      return {
        status: CALL_STATES.CONFIRM_CAREGIVER,
        contact,
        title: `Call ${contact.name}?`,
        description: `This will open your phone's dialer to call ${contact.name} (${contact.phone}).`,
        requiresConfirmation: true
      };
    }

    store.recordEmergencyEvent({
      action: 'caregiver_call_requested',
      status: 'confirmed',
      details: `Call requested for ${contact.name} (${contact.phone})`
    });

    return this.initiateCall(contact.phone, contact.name);
  }

  cancelCall() {
    this.activeCallState = CALL_STATES.CANCELLED;
    store.recordEmergencyEvent({
      action: 'cancelled',
      status: 'cancelled',
      details: 'Emergency action cancelled by user'
    });
    return {
      status: CALL_STATES.CANCELLED,
      message: 'Call cancelled. Returning to Emergency Help.'
    };
  }

  initiateCall(number, contactName = 'Emergency 112') {
    if (!this.isTelephonySupported()) {
      this.activeCallState = CALL_STATES.CALL_UNAVAILABLE;
      store.recordEmergencyEvent({
        action: 'call_unavailable',
        status: 'unsupported_device',
        details: `Cannot open ${number} on this device. Telephony not available.`
      });
      return {
        status: CALL_STATES.CALL_UNAVAILABLE,
        number,
        contactName,
        message: "Calling isn't available on this device."
      };
    }

    this.activeCallState = CALL_STATES.CALL_INITIATED;
    const is112 = number === '112';

    store.recordEmergencyEvent({
      action: is112 ? 'call_112_opened' : 'caregiver_call_opened',
      status: 'initiated',
      details: `Opening device dialer for ${contactName} (${number})`
    });

    if (typeof window !== 'undefined' && window.location) {
      try {
        window.location.href = `tel:${number}`;
      } catch (err) {
        console.warn('Dialer launch error:', err);
      }
    }

    return {
      status: CALL_STATES.CALL_INITIATED,
      number,
      contactName,
      message: "Your phone's calling screen has been opened.",
      disclaimer: "Please complete the call in your phone's calling screen."
    };
  }
}

export const emergencyService = new EmergencyService();
