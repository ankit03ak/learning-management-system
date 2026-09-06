import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstructorContext } from "@/context/instructor-context";
import { mediaDeleteService, mediaUploadService } from "@/services";
import { useContext } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { toast } from "react-toastify";

const CourseSettings = () => {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const handleImageChange = async (event) => {
    const selectedImage = event.target.files[0];

    if (selectedImage) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);

      try {
        setMediaUploadProgress(true);

        const res = await mediaUploadService(
          imageFormData,
          setMediaUploadProgressPercentage
        );

        if (!res?.success || !res?.result?.url) {
          toast.error("Unable to upload course thumbnail.");
          return;
        }

        const oldImagePublicId = courseLandingFormData.imagePublicId;
        setCourseLandingFormData({
          ...courseLandingFormData,
          image: res.result.url,
          imagePublicId: res.result.public_id,
        });

        // Delete only after the replacement has uploaded successfully.
        if (oldImagePublicId) {
          const deleteResponse = await mediaDeleteService(oldImagePublicId);
          if (!deleteResponse?.success) {
            toast.warning("The old thumbnail could not be removed.");
          }
        }
      } catch {
        toast.error("Error uploading course thumbnail.");
      } finally {
        setMediaUploadProgress(false);
        setMediaUploadProgressPercentage(0);
        event.target.value = "";
      }
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Settings</CardTitle>
      </CardHeader>
      <div className="p-4">
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
      </div>
      <CardContent className="flex items-center justify-center">
        {courseLandingFormData?.image ? (
          <div>
            <div className="flex mb-3 items-center justify-center">
              <Input
                id="replace-course-image"
                onChange={handleImageChange}
                type="file"
                accept="image/*"
                className="hidden"
              />
              <Button asChild>
                <label htmlFor="replace-course-image">Replace Image</label>
              </Button>
            </div>
            <LazyLoadImage
              src={courseLandingFormData.image}
              alt="Course Thumbnail"
              effect="blur"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Label htmlFor="course-image-upload">Upload course thumbnail</Label>
            <Input
              id="course-image-upload"
              onChange={handleImageChange}
              type="file"
              accept="image/*"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseSettings;
