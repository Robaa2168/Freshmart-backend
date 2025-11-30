// File: routes/Volunteering/partnerOrganizationRoutes.js
const express = require("express");
const multer = require("multer");
const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");
const partnerOrgController = require("../../controllers/Volunteering/partnerOrganizationController");

const upload = multer();

/**
 * Creation
 */
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  partnerOrgController.createOrganization
);

/**
 * Read
 * Put slug route before :orgId to avoid conflicts
 */
router.get("/slug/:slug", partnerOrgController.getOrganizationBySlug);
router.get("/owner/:userId", partnerOrgController.getOrganizationsByOwner);
router.get("/my", authMiddleware, partnerOrgController.getMyOrganizations);
router.get("/", partnerOrgController.getAllOrganizations);
router.get("/:orgId", partnerOrgController.getOrganizationById);

/**
 * Update core fields
 */
router.put(
  "/:orgId",
  authMiddleware,
  upload.none(),
  partnerOrgController.updateOrganization
);

/**
 * Delete org (soft delete)
 */
router.delete(
  "/:orgId",
  authMiddleware,
  partnerOrgController.deleteOrganization
);

/**
 * Media: logo
 */
router.post(
  "/:orgId/logo",
  authMiddleware,
  upload.single("logo"),
  partnerOrgController.uploadLogo
);

router.delete(
  "/:orgId/logo",
  authMiddleware,
  partnerOrgController.deleteLogo
);

/**
 * Media: cover image
 */
router.post(
  "/:orgId/cover",
  authMiddleware,
  upload.single("coverImage"),
  partnerOrgController.uploadCover
);

router.delete(
  "/:orgId/cover",
  authMiddleware,
  partnerOrgController.deleteCover
);

/**
 * Media: gallery
 */
router.post(
  "/:orgId/gallery",
  authMiddleware,
  upload.array("gallery", 10),
  partnerOrgController.uploadGalleryImages
);

router.delete(
  "/:orgId/gallery",
  authMiddleware,
  partnerOrgController.deleteGalleryImage
);

/**
 * Media: documents
 */
router.post(
  "/:orgId/documents",
  authMiddleware,
  upload.single("document"),
  partnerOrgController.uploadDocument
);

router.delete(
  "/:orgId/documents/:docIndex",
  authMiddleware,
  partnerOrgController.deleteDocument
);

module.exports = router;
