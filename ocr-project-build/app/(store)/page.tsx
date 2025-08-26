"use client";

import { useState } from "react"
import Button from "@/components/ui/button"
import { PhotoIcon } from "@heroicons/react/24/solid"

export default function Home() {
  // Form field state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dob, setDob] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [extractionMethod, setExtractionMethod] = useState<"standard" | "ai">("standard")

  // Validation errors per field
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    dob?: string
    file?: string
  }>({})

  // Handle file picker change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    if (selected) {
      setErrors(prev => ({ ...prev, file: undefined }))
    }
  }

  // Handle radio button changes
  const handleMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtractionMethod(e.target.value === "ai-method" ? "ai" : "standard")
  }

  // handle date changes, prevent date from being greater than today
  const today = new Date().toISOString().split('T')[0];
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setDob(val)
    setErrors(prev => ({ ...prev, dob: undefined }))

    // immediate guard: if user somehow enters a future date 
    if (val > today) {
      setErrors(prev => ({ ...prev, dob: "DOB cannot be in the future" }))
    }
  }

  // Validate all fields; return an object of errors
  const validate = () => {
    const newErrors: typeof errors = {}

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!dob) {
      newErrors.dob = "Date of birth is required"
    }else if (dob > today) {
      newErrors.dob = "DOB cannot be in the future"
    }
    if (!file) {
      newErrors.file = "Please upload a PDF, PNG, or JPG"
    }

    return newErrors
  }

  // On form submit, prevent default, run validation, or proceed
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return // Stop submission if there are errors
    }

    // If no errors, you can continue to submit via axios
    e.currentTarget.submit()
  }

  return (
    <div className="isolate bg-gray-900 px-6 py-24 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          Data Entry
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1">
        <form
          onSubmit={handleSubmit}
          noValidate
          action="/api/upload"
          method="POST"
          encType="multipart/form-data"
        >
          {/* Personal Info Section */}
          <div className="space-y-12 border-b border-white/10 pb-12">
            <h3 className="text-base/7 font-semibold text-white">
              Personal Information
            </h3>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* First Name */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm/6 font-medium text-white"
                >
                  First Name
                </label>
                <div className="mt-2">
                  <input
                    id="first-name"
                    name="first-name"
                    placeholder="First Name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={e => {
                      setFirstName(e.target.value)
                      setErrors(prev => ({ ...prev, firstName: undefined }))
                    }}
                    aria-invalid={!!errors.firstName}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm/6 font-medium text-white"
                >
                  Last Name
                </label>
                <div className="mt-2">
                  <input
                    id="last-name"
                    name="last-name"
                    placeholder="Last Name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={e => {
                      setLastName(e.target.value)
                      setErrors(prev => ({ ...prev, lastName: undefined }))
                    }}
                    aria-invalid={!!errors.lastName}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="dob"
                  className="block text-sm/6 font-medium text-white"
                >
                  Date of Birth
                </label>
                <div className="mt-2">
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    max={today}
                    value={dob}
                    onChange={handleDobChange}
                    aria-invalid={!!errors.dob}
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
                {errors.dob && (
                  <p className="mt-1 text-sm text-red-500">{errors.dob}</p>
                )}
              </div>

              {/* File Upload */}
              <div className="col-span-full">
                <label
                  htmlFor="file-upload"
                  className="block text-sm/6 font-medium text-white"
                >
                  Document or Image to be Extracted
                </label>
                <div className="mt-2 flex justify-center rounded-lg border-dashed border border-white/25 px-6 py-10">
                  <div className="text-center">
                    <PhotoIcon
                      aria-hidden="true"
                      className="mx-auto h-12 w-12 text-gray-600"
                    />
                    <div className="mt-4 flex items-center justify-center space-x-1 text-sm text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <span>Select a File to Upload</span>
                        <input
                          id="file-upload"
                          name="file"
                          type="file"
                          accept="application/pdf,image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {errors.file && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.file}
                      </p>
                    )}
                    <p className="mt-2 text-xs/5 text-gray-400">
                      PDF, PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Extraction Method */}
              <div className="col-span-full">
                <fieldset>
                  <legend className="text-sm/6 font-semibold text-white">
                    Processing Method
                  </legend>
                  <p className="mt-1 text-sm/6 text-gray-400">
                    Your uploaded file will be processed via the selected choice.
                  </p>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-x-3">
                      <input
                        id="standard-method"
                        name="extraction-method"
                        type="radio"
                        value="standard-method"
                        checked={extractionMethod === "standard"}
                        onChange={handleMethodChange}
                        className="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      />
                      <label
                        htmlFor="standard-method"
                        className="block text-sm/6 font-medium text-white"
                      >
                        Standard Extraction
                      </label>
                    </div>
                    <div className="flex items-center gap-x-3">
                      <input
                        id="ai-method"
                        name="extraction-method"
                        type="radio"
                        value="ai-method"
                        checked={extractionMethod === "ai"}
                        onChange={handleMethodChange}
                        className="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      />
                      <label
                        htmlFor="ai-method"
                        className="block text-sm/6 font-medium text-white"
                      >
                        AI Extraction
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button
              variant="secondary"
              type="reset"
              onClick={() => {
                // Clear all state and errors
                setFirstName("")
                setLastName("")
                setDob("")
                setFile(null)
                setExtractionMethod("standard")
                setErrors({})
              }}
              className="text-sm/6 font-semibold text-white"
            >
              Clear
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm/6 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}