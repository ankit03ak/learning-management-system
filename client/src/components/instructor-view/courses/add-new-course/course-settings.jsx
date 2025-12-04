import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstructorContext } from "@/context/instructor-context";
import { mediaDeleteService, mediaUploadService } from "@/services";
import React, { useContext } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

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

        if (res?.success) {

          setCourseLandingFormData({
            ...courseLandingFormData,
            image: res?.result?.url,
            imagePublicId: res?.result?.public_id,
          });

          setMediaUploadProgress(false);
        }
      } catch (error) {}
    } else {
    }
  };

  const handleReplaceImage = async () => {

    const imagePublicId = courseLandingFormData.imagePublicId;

    if (!imagePublicId) {
      toast.warning("Public ID missing for image replacement");
      return;
    }

    const response = await mediaDeleteService(imagePublicId);

    if (response?.success) {
      setCourseLandingFormData({
        ...courseLandingFormData,
        image: "",
        imagePublicId: "",
      });
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
              <Button onClick={() => handleReplaceImage()}>
                Replace Image
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
            <Label>Uplaod course thumbnail</Label>
            <Input onChange={handleImageChange} type="file" accept="image/*" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseSettings;
