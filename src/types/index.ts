@@ .. @@
 export interface BookingFormData {
   pickup: string;
   destination: string;
   stopover?: string;
   date: string;
   time: string;
   paymentMethod: string;
+  vehicleType?: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationLat?: number;
  destinationLng?: number;
 }