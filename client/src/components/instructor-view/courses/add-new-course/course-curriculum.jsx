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
  updateCourseByIdService,
} from "@/services";
import { Upload } from "lucide-react";
import { useContext, useRef } from "react";
import { toast } from "react-toastify";

const CourseCurriculum = () => {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
    currentEditedCourseId,
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

        if (res?.success && res?.result?.url) {
          let copyCourseCurriculumFormData = [...courseCurriculumFormData];
          
          copyCourseCurriculumFormData[currentIndex] = {
            ...copyCourseCurriculumFormData[currentIndex],
            videoUrl: res?.result?.url,
            public_id: res?.result?.public_id,
          };

          setCourseCurriculumFormData(copyCourseCurriculumFormData);
        } else {
          toast.error("Unable to upload video.");
        }
      } catch {
        toast.error("Error in video upload on course curriculum page");
      } finally {
        setMediaUploadProgress(false);
        setMediaUploadProgressPercentage(0);
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
        typeof item.title === "string" &&
        item.title.trim() !== "" &&
        typeof item.videoUrl === "string" &&
        item.videoUrl.trim() !== ""
      );
    });
  };

  const handleReplaceVideo = async (event, currentIndex) => {
    const selectedFile = event.target.files?.[0];
    const currentItem = courseCurriculumFormData[currentIndex];

    if (!selectedFile || !currentItem) return;

    const videoFormData = new FormData();
    videoFormData.append("file", selectedFile);

    try {
      setMediaUploadProgress(true);
      const uploadResponse = await mediaUploadService(
        videoFormData,
        setMediaUploadProgressPercentage
      );

      if (!uploadResponse?.success || !uploadResponse?.result?.url) {
        toast.error("Unable to upload replacement video.");
        return;
      }

      const replacement = uploadResponse.result;
      const copyCourseCurriculumFormData = [...courseCurriculumFormData];
      copyCourseCurriculumFormData[currentIndex] = {
        ...currentItem,
        videoUrl: replacement.url,
        public_id: replacement.public_id,
      };
      setCourseCurriculumFormData(copyCourseCurriculumFormData);

      if (currentItem.public_id) {
        const deleteResponse = await mediaDeleteService(currentItem.public_id);
        if (!deleteResponse?.success) {
          toast.warning("The old video could not be removed.");
        }
      }
    } catch {
      toast.error("Error replacing video.");
    } finally {
      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
      event.target.value = "";
    }
  };

  const bulkUploadInputRef = useRef(null);

  const handleOpenBulkUploadDialog = () => {
    bulkUploadInputRef.current?.click();
  };

  const areAllCourseCurriculumFormDataObjectsEmpty = (arr) => {
    return arr.every((obj) => {
      return Object.entries(obj).every(([, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  };

  const handleMediaBulkUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    const bulkFormData = new FormData();
    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try{
      
      setMediaUploadProgress(true);
      const response = await mediaBulkUploadService(
        bulkFormData,
        setMediaUploadProgressPercentage
      );


      if (response?.success && Array.isArray(response?.result)) {
        let copyCourseCurriculumFormData =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData)
            ? []
            : [...courseCurriculumFormData];

        copyCourseCurriculumFormData = [
          ...copyCourseCurriculumFormData,
          ...(response?.result || []).map((item, index) => ({
            videoUrl: item?.url,
            public_id: item?.public_id,
            title: `Lecture ${copyCourseCurriculumFormData.length + index + 1}`,
            freePreview: false,
          })),
        ];

        setCourseCurriculumFormData(copyCourseCurriculumFormData);
      } else {
        toast.error("Unable to upload the selected videos.");
      }
    } catch {
      toast.error("Error bulk uploading files");
    } finally {
      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
    }
  };

  const handleDeleteLecture = async (currentIndex) => {
    const currentLecture = courseCurriculumFormData[currentIndex];
    const updatedCurriculum = courseCurriculumFormData.filter(
      (_, index) => index !== currentIndex
    );

    if (!currentLecture) {
      toast.error("Lecture not found.");
      return;
    }

    const publicId = currentLecture.public_id;

    try {
      if (currentEditedCourseId) {
        const courseResponse = await updateCourseByIdService(
          currentEditedCourseId,
          { curriculum: updatedCurriculum }
        );

        if (!courseResponse?.success) {
          toast.error(courseResponse?.message || "Unable to delete lecture.");
          return;
        }
      }

      if (publicId) {
        try {
          await mediaDeleteService(publicId);
        } catch (error) {
          if (error?.response?.status !== 404) {
            toast.warning(
              "Lecture removed, but its uploaded media could not be deleted."
            );
          }
        }
      }

      setCourseCurriculumFormData(updatedCurriculum);
      toast.success("Lecture deleted successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error deleting lecture"
      );
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
                    <Input
                      id={`replace-video-${index}`}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(event) =>
                        handleReplaceVideo(event, index)
                      }
                    />
                    <Button asChild>
                      <label htmlFor={`replace-video-${index}`}>
                        Replace Lecture
                      </label>
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
