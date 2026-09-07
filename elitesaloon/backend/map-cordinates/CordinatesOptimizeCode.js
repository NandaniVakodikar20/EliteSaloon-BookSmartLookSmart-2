const OwnerModel = require('../models/OwnerModel');

// const nearBySalons = async (req, res) => {
//     try {

//          const { latitude, longitude } = req.body;
        
//         if (latitude === undefined || longitude === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Latitude and longitude are required"
//             });
//         }

//         const customerLatitude = Number(latitude);
//         const customerLongitude = Number(longitude);
        
//         if (
//             Number.isNaN(customerLatitude) ||
//             Number.isNaN(customerLongitude)
//         ) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Latitude and longitude must be valid numbers"
//             });
//         }

//         // Validate latitude
//         if (customerLatitude < -90 || customerLatitude > 90) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid latitude"
//             });
//         }

//         // Validate longitude
//         if (customerLongitude < -180 || customerLongitude > 180) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid longitude"
//             });
//         }

//         // Get active + approved owners
//         const owners = await OwnerModel.find({
//             ownerAccountStatus: "ACTIVE",
//             ownerApprovedStatus: "APPROVE",
//             ownerVerified: true
//         }).select("_id");
//         // .select(
//         //     "ownerName ownerShopName ownerShopStreet ownerShopCity ownerShopDistrict ownerShopPincode ownerShopState ownerLatitude ownerLongitude ownerProfileImage"
//         // );

//         console.log("Owner", owners);

//         const EARTH_RADIUS_KM = 6371;
//         const RADIUS_KM = 5;

//         const nearbySalons = [];

//         owners.forEach(owner => {

//             const ownerLatitude = Number(owner.ownerLatitude);
//             const ownerLongitude = Number(owner.ownerLongitude);

//             // Convert degrees to radians
//             const lat1 = customerLatitude * Math.PI / 180;
//             const lat2 = ownerLatitude * Math.PI / 180;

//             const deltaLatitude =
//                 (ownerLatitude - customerLatitude) * Math.PI / 180;

//             const deltaLongitude =
//                 (ownerLongitude - customerLongitude) * Math.PI / 180;

//             // Haversine formula
//             const a =
//                 Math.sin(deltaLatitude / 2) *
//                 Math.sin(deltaLatitude / 2) +
//                 Math.cos(lat1) *
//                 Math.cos(lat2) *
//                 Math.sin(deltaLongitude / 2) *
//                 Math.sin(deltaLongitude / 2);

//             const c =
//                 2 * Math.atan2(
//                     Math.sqrt(a),
//                     Math.sqrt(1 - a)
//                 );

//             const distance = EARTH_RADIUS_KM * c;

//             // Only salons within 5 KM
//             if (distance <= RADIUS_KM) {
//                 nearbySalons.push({
//                     ownerId: owner._id,
//                     ownerName: owner.ownerName,
//                     ownerShopName: owner.ownerShopName,

//                     address: {
//                         street: owner.ownerShopStreet,
//                         city: owner.ownerShopCity,
//                         district: owner.ownerShopDistrict,
//                         pincode: owner.ownerShopPincode,
//                         state: owner.ownerShopState
//                     },

//                     latitude: owner.ownerLatitude,
//                     longitude: owner.ownerLongitude,

//                     ownerProfileImage: owner.ownerProfileImage,

//                     distance: Number(distance.toFixed(2))
//                 });
//             }
//         });

//         // Sort nearest salon first
//         nearbySalons.sort(
//             (a, b) => a.distance - b.distance
//         );

//         // return res.status(200).json({
//         //     success: true,
//         //     message: "Nearby salons retrieved successfully",

//         //     customerLocation: {
//         //         latitude: customerLatitude,
//         //         longitude: customerLongitude
//         //     },
//         //     totalSalons: nearbySalons.length,
//         //     owners : nearbySalons
//         // });

//         return nearbySalons;

//     } catch (error) {

//         console.error("Nearby Salon API Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// };

// module.exports = {
//     nearBySalons
// }


const findNearbyOwners = async (latitude, longitude, radiusKm = 5) => {

    const customerLatitude = Number(latitude);
    const customerLongitude = Number(longitude);

    if (
        Number.isNaN(customerLatitude) ||
        Number.isNaN(customerLongitude)
    ) {
        throw new Error("Latitude and longitude must be valid numbers");
    }

    const owners = await OwnerModel.find({
        ownerAccountStatus: "ACTIVE",
        ownerApprovedStatus: "APPROVE",
        ownerVerified: true
    }).select(
        "_id ownerName ownerShopName ownerShopStreet ownerShopCity ownerShopDistrict ownerShopPincode ownerShopState ownerLatitude ownerLongitude ownerProfileImage"
    );

    const EARTH_RADIUS_KM = 6371;

    const nearbySalons = [];

    owners.forEach(owner => {

        const ownerLatitude = Number(owner.ownerLatitude);
        const ownerLongitude = Number(owner.ownerLongitude);

        if (
            Number.isNaN(ownerLatitude) ||
            Number.isNaN(ownerLongitude)
        ) {
            return;
        }

        const lat1 = customerLatitude * Math.PI / 180;
        const lat2 = ownerLatitude * Math.PI / 180;

        const deltaLatitude =
            (ownerLatitude - customerLatitude) * Math.PI / 180;

        const deltaLongitude =
            (ownerLongitude - customerLongitude) * Math.PI / 180;

        const a =
            Math.sin(deltaLatitude / 2) ** 2 +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLongitude / 2) ** 2;

        const c =
            2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        const distance = EARTH_RADIUS_KM * c;

        if (distance <= radiusKm) {

            nearbySalons.push({
                ownerId: owner._id,
                ownerName: owner.ownerName,
                ownerShopName: owner.ownerShopName,

                address: {
                    street: owner.ownerShopStreet,
                    city: owner.ownerShopCity,
                    district: owner.ownerShopDistrict,
                    pincode: owner.ownerShopPincode,
                    state: owner.ownerShopState
                },

                latitude: owner.ownerLatitude,
                longitude: owner.ownerLongitude,

                ownerProfileImage: owner.ownerProfileImage,

                distance: Number(distance.toFixed(2))
            });
        }
    });

    nearbySalons.sort(
        (a, b) => a.distance - b.distance
    );

    return nearbySalons;
};

module.exports = {
    findNearbyOwners
};