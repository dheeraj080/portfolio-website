"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TExifData, TImageInfo } from "@/modules/photos/lib/utils";
import { PhotoFormData, INITIAL_FORM_VALUES, STEP_CONFIG } from "./types";
import type { AddressData } from "@/modules/mapbox/hooks/use-get-address";
import { FirstStep } from "./steps/first-step";
import { SecondStep } from "./steps/second-step";
import { ThirdStep } from "./steps/third-step";
import { FourthStep } from "./steps/fourth-step";
import { ProgressBar } from "./components/progress-bar";
import { StepIndicator } from "./components/step-indicator";
import { SuccessScreen } from "./components/success-screen";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MultiStepFormProps {
  className?: string;
  onSubmit?: (data: PhotoFormData) => void;
}

export default function MultiStepForm({
  className,
  onSubmit,
}: MultiStepFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createPhoto = useMutation(trpc.photos.create.mutationOptions());
  const removeS3Object = useMutation(trpc.s3.deleteFile.mutationOptions());

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] =
    useState<Partial<PhotoFormData>>(INITIAL_FORM_VALUES);
  const [url, setUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<TExifData | null>(null);
  const [imageInfo, setImageInfo] = useState<TImageInfo>();
  const [address, setAddress] = useState<AddressData>(null);

  const handleUploadSuccess = (
    uploadedUrl: string,
    uploadedExif: TExifData | null,
    uploadedImageInfo: TImageInfo,
  ) => {
    setUrl(uploadedUrl);
    setExif(uploadedExif);
    setImageInfo(uploadedImageInfo);
  };

  const handleReupload = (url: string) => {
    removeS3Object.mutate({ key: url });
    setUrl(null);
    setExif(null);
    setImageInfo(undefined);
  };

  const handleNext = (data: Partial<PhotoFormData>) => {
    let updatedData = { ...formData, ...data };

    if (step === 0) {
      updatedData = {
        ...updatedData,
        url: url || "",
        exif,
        imageInfo,
        make: exif?.make,
        model: exif?.model,
        lensModel: exif?.lensModel,
        focalLength: exif?.focalLength,
        focalLength35mm: exif?.focalLength35mm,
        fNumber: exif?.fNumber,
        iso: exif?.iso,
        exposureTime: exif?.exposureTime,
        exposureCompensation: exif?.exposureCompensation,
        latitude: exif?.latitude,
        longitude: exif?.longitude,
        gpsAltitude: exif?.gpsAltitude,
        dateTimeOriginal: exif?.dateTimeOriginal,
      };
    }

    setFormData(updatedData);

    if (step < STEP_CONFIG.length - 1) {
      setStep(step + 1);
    } else {
      const finalData = {
        ...updatedData,
        url: url || "",
        title: updatedData.title || "",
        description: updatedData.description || "",
        aspectRatio: imageInfo ? imageInfo.width / imageInfo.height : 1,
        width: imageInfo?.width || 0,
        height: imageInfo?.height || 0,
        blurData: imageInfo?.blurhash || "",
        country: address?.features?.[0]?.properties?.context?.country?.name,
        countryCode:
          address?.features?.[0]?.properties?.context?.country?.country_code,
        region: address?.features?.[0]?.properties?.context?.region?.name,
        city:
          address?.features?.[0]?.properties?.context?.country?.country_code ===
            "JP" ||
          address?.features?.[0]?.properties?.context?.country?.country_code ===
            "TW"
            ? address?.features?.[0]?.properties?.context?.region?.name
            : address?.features?.[0]?.properties?.context?.place?.name,
        district: address?.features?.[0]?.properties?.context?.locality?.name,
        fullAddress: address?.features?.[0]?.properties?.full_address,
        placeFormatted: address?.features?.[0]?.properties?.place_formatted,
      };

      setIsSubmitting(true);

      createPhoto.mutate(finalData, {
        onSuccess: async () => {
          await queryClient.invalidateQueries(
            trpc.photos.getMany.queryOptions({}),
          );
          await queryClient.invalidateQueries(
            trpc.home.getManyLikePhotos.queryOptions({ limit: 10 }),
          );
          await queryClient.invalidateQueries(
            trpc.home.getCitySets.queryOptions({ limit: 9 }),
          );
          await queryClient.invalidateQueries(trpc.city.getMany.queryOptions());

          toast.success("Photo uploaded successfully!");
          setIsComplete(true);
          setIsSubmitting(false);

          if (onSubmit) {
            onSubmit(finalData as PhotoFormData);
          }
        },
        onError: (error) => {
          toast.error(error.message);
          setIsSubmitting(false);
        },
      });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(0);
    setFormData(INITIAL_FORM_VALUES);
    setIsComplete(false);
    setUrl(null);
    setExif(null);
    setImageInfo(undefined);
    setAddress(null);
  };

  const handleAddressUpdate = (addressData: AddressData) => {
    setAddress(addressData);
  };

  const variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const renderStep = () => {
    const commonProps = {
      initialData: formData,
      isSubmitting,
      onBack: handleBack,
    };

    switch (step) {
      case 0:
        return (
          <FirstStep
            {...commonProps}
            url={url}
            exif={exif}
            imageInfo={imageInfo}
            onUploadSuccess={handleUploadSuccess}
            onReupload={handleReupload}
            onNext={handleNext}
          />
        );
      case 1:
        return <SecondStep {...commonProps} exif={exif} onNext={handleNext} />;
      case 2:
        return (
          <ThirdStep
            {...commonProps}
            onNext={handleNext}
            onAddressUpdate={handleAddressUpdate}
          />
        );
      case 3:
        return <FourthStep {...commonProps} onNext={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("mx-auto w-full flex flex-col min-h-0", className)}>
      {!isComplete ? (
        <div className="flex flex-col h-full">
          {/* Sticky Header for Progress */}
          <div className="shrink-0 bg-background sticky top-0 z-20 pb-4 border-b mb-6">
            <ProgressBar currentStep={step} totalSteps={STEP_CONFIG.length} />
            <StepIndicator steps={STEP_CONFIG} currentStep={step} />
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold">
                    {STEP_CONFIG[step].title}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {STEP_CONFIG[step].description}
                  </p>
                </div>

                {/* Form Content */}
                <div className="pb-10">{renderStep()}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <SuccessScreen onReset={handleReset} />
      )}
    </div>
  );
}
