import Button from "@/components/ui/button";
import { PhotoIcon } from '@heroicons/react/24/solid'

export default function Home() {
  return (
  <div className="isolate bg-gray-900 px-6 py-24 sm:py-16 lg:px-8">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">Data Entry</h2>
    </div>
    <br></br>
    <div className="grid grid-cols-1">
      <form
        action='/api/upload'
        method="POST"
        encType="multipart/form-data"      
      >
      <div className="space-y-12">

        <div className="border-b border-white/10 pb-12">
          <h2 className="text-base/7 font-semibold text-white">Personal Information</h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="first-name" className="block text-sm/6 font-medium text-white">
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="first-name"
                  name="first-name"
                  placeholder="First Name"
                  type="text"
                  autoComplete="given-name"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="last-name" className="block text-sm/6 font-medium text-white">
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="last-name"
                  name="last-name"
                  placeholder="Last Name"
                  type="text"
                  autoComplete="family-name"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="dob" className="block text-sm/6 font-medium text-white">
                Date of Birth
              </label>
              <div className="mt-2">
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="cover-photo" className="block text-sm/6 font-medium text-white">
                Document or Image to be Extracted
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-600" />
                  <div className="mt-4 flex text-sm/6 text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500 hover:text-indigo-300"
                    >
                      <span>Select a File to Upload</span>
                      <input id="file-upload" name="file" type="file" className="sr-only" />
                    </label>
                    {/* <p className="pl-1">or drag and drop</p> */}
                  </div>
                  <p className="text-xs/5 text-gray-400">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <fieldset>
                <legend className="text-sm/6 font-semibold text-white">Processing Method</legend>
                <p className="mt-1 text-sm/6 text-gray-400">Your uploaded file will be processed via the selected choice.</p>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-x-3">
                    <input
                      defaultChecked
                      id="standard-method"
                      value="standard-method"
                      name="extraction-method"
                      type="radio"
                      className="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-white/5 disabled:bg-white/10 disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
                    />
                    <label htmlFor="standard-method" className="block text-sm/6 font-medium text-white">
                      Standard Extraction
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="ai-method"
                      value="ai-method"
                      name="extraction-method"
                      type="radio"
                      className="relative size-4 appearance-none rounded-full border border-white/10 bg-white/5 before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-white/5 disabled:bg-white/10 disabled:before:bg-white/20 forced-colors:appearance-auto forced-colors:before:hidden"
                    />
                    <label htmlFor="ai-method" className="block text-sm/6 font-medium text-white">
                      AI Extraction
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="secondary" type="reset" className="text-sm/6 font-semibold text-white">Clear</Button>
        <Button variant="primary" type="submit" className="rounded-md bg-indigo-500 px-3 py-2 text-sm/6 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Save</Button>
      </div>
      </form>
    </div>
  </div>
  );
}
