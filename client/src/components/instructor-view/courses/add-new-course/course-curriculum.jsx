import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import { Upload } from "lucide-react";
import React, { useContext, useRef } from "react";

const CourseCurriculum = () => {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const handleNewLecture = () => {
    setCourseCurriculumFormData([
      ...courseCurriculumFormData,
      {
        ...courseCurriculumInitialFormData[0],
      },
    ]);
  };

  const handleCourseTitleChange = (event, currentIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];

    copyCourseCurriculumFormData[currentIndex] = {
      ...copyCourseCurriculumFormData[currentIndex],
      title: event.target.value,
    };

    setCourseCurriculumFormData(copyCourseCurriculumFormData);
  };

  const handleFreepreviewChange = (currentValue, currentIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];

    copyCourseCurriculumFormData[currentIndex] = {
      ...copyCourseCurriculumFormData[currentIndex],
      freePreview: currentValue,
    };

    setCourseCurriculumFormData(copyCourseCurriculumFormData);
  };

  const handleSingleLectureUpload = async (event, currentIndex) => {
   

    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const videoFormData = new FormData();
      videoFormData.append("file", selectedFile);

      try {
        setMediaUploadProgress(true);

        const res = await mediaUploadService(
          videoFormData,
          setMediaUploadProgressPercentage
        );

        if (res?.success) {
          let copyCourseCurriculumFormData = [...courseCurriculumFormData];
          
          copyCourseCurriculumFormData[currentIndex] = {
            ...copyCourseCurriculumFormData[currentIndex],
            videoUrl: res?.result?.url,
            public_id: res?.result?.public_id,
          };

          setCourseCurriculumFormData(copyCourseCurriculumFormData);
          setMediaUploadProgress(false);
        }
      } catch (error) {
        toast.error("Error in video upload on course curriculum page");
      }
      finally{
        setMediaUploadProgress(false)
      }
    } else {
      toast.error("Selected video lecture empty on course curriculum page");
    }
  };


  const isCourseCurriculumFormDataValid = () => {
    return courseCurriculumFormData.every((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.title.trim() !== "" &&
        item.videoUrl.trim() !== ""
      );
    });
  };

  const handleReplaceVideo = async (currentIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];

    const currentItem = copyCourseCurriculumFormData[currentIndex];

    if (!currentItem?.public_id) {
      console.error("public_id is missing for this item.");
      return;
    }

    const getCurrentVideoPublicId =
      copyCourseCurriculumFormData[currentIndex].public_id;

    const deleteCurrentMedia = await mediaDeleteService(
      getCurrentVideoPublicId
    );


    if (deleteCurrentMedia?.success) {
      copyCourseCurriculumFormData[currentIndex] = {
        ...copyCourseCurriculumFormData[currentIndex],
        videoUrl: "",
        public_id: "",
      };
    }

    setCourseCurriculumFormData(copyCourseCurriculumFormData);
  };

  const bulkUploadInputRef = useRef(null);

  const handleOpenBulkUploadDialog = () => {
    bulkUploadInputRef.current?.click();
  };

  const areAllCourseCurriculumFormDataObjectsEmpty = (arr) => {
    return arr.every((obj) => {
      return Object.entries(obj).every(([key, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  };

  const handleMediaBulkUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    const bulkFormData = new FormData();
    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try{
      
      setMediaUploadProgress(true);
      const response = await mediaBulkUploadService(
        bulkFormData,
        setMediaUploadProgressPercentage
      );


      if (response?.success) {
        let copyCourseCurriculumFormData =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData)
            ? []
            : [...courseCurriculumFormData];

        copyCourseCurriculumFormData = [
          ...copyCourseCurriculumFormData,
          ...response?.result?.map((item, index) => ({
            videoUrl: item?.url,
            public_id: item?.public_id,
            title: `Lecture ${copyCourseCurriculumFormData.length + index + 1}`,
            freePreview: false,
          })),
        ];

        setCourseCurriculumFormData(copyCourseCurriculumFormData);
      }
    } catch (error) {
      toast.error("Error bulk uploading files",error);
    } finally {
      setMediaUploadProgress(false);
    }
  };

  const handleDeleteLecture = async (currentIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];

    const publicId = copyCourseCurriculumFormData[currentIndex].public_id;

    if (!publicId) {
      toast.error("Public id of video to be deleted is missing");
      return;
    }

    try {
      const response = await mediaDeleteService(publicId);

      if (response?.success) {
        copyCourseCurriculumFormData = copyCourseCurriculumFormData.filter(
          (_, index) => index !== currentIndex
        );
        setCourseCurriculumFormData(copyCourseCurriculumFormData);
      }
      toast.success("Lecture deleted successfully");
      
    } catch (error) {
      toast.error("Error deleting lecture");
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Create Course Curriculum</CardTitle>
        <div>
          <Input
            type="file"
            ref={bulkUploadInputRef}
            accept="video/*"
            multiple
            className="hidden"
            id="bulk-media-upload"
            onChange={handleMediaBulkUpload}
          />
          <Button
            as="label"
            htmlFor="bulk-media-upload"
            variant="outline"
            className="cursor-pointer"
            onClick={handleOpenBulkUploadDialog}
          >
            <Upload className="w-4 h-5 mr-2" />
            Bulk Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          disabled={!isCourseCurriculumFormDataValid() || mediaUploadProgress}
          onClick={handleNewLecture}
        >
          Add Lecture
        </Button>
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
        <div className="mt-4 space-y-4">
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <div className="border p-5 rounded-md" key={index}>
              <div className="flex gap-5 items-center">
                <h3 className="font-semibold">Lecture {index + 1}</h3>
                <Input
                  name={`title ${index + 1}`}
                  placeholder="Enter lecture title"
                  className="max-w-96"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={courseCurriculumFormData[index]?.title}
                />
                <div className="flex ite space-x-2">
                  <Switch
                    onCheckedChange={(value) =>
                      handleFreepreviewChange(value, index)
                    }
                    checked={courseCurriculumFormData[index]?.freePreview}
                    id={`freePreview ${index + 1}`}
                  />
                  <Label htmlFor={`freePreview ${index + 1}`}>
                    Free Preview
                  </Label>
                </div>
              </div>
              <div className="mt-6">
                {courseCurriculumFormData[index]?.videoUrl ? (
                  <div className="flex gap-3 ">
                    <VideoPlayer
                      url={courseCurriculumFormData[index]?.videoUrl}
                      width="450px"
                      height="200px"
                      useProgressUpdate={false}
                    />
                    <Button onClick={() => handleReplaceVideo(index)}>
                      Repalce Lecture
                    </Button>
                    <Button
                      className="bg-red-600"
                      onClick={() => handleDeleteLecture(index)}
                    >
                      Delete Lecture
                    </Button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(event) =>
                      handleSingleLectureUpload(event, index)
                    }
                    className="mb-4"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCurriculum;
