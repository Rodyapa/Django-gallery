
document.addEventListener("DOMContentLoaded", () => {
    let inputElement;
    let listOfUploadedFiles;
    let error;
    let lastUsedId = 0;
    const dropzone_container = document.querySelector('div[class=dropzone-container]');
    const dropzone_text_instruction = document.querySelector('div[class=dropzone-text-instruction]');
    const imageInputAccept = '.png, .jpeg, .jpg';
    const sizeLimits = {
      image: 40 * 1024 * 1024,
    };
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const uploadedFiles = [];
  
  dropzone_container.addEventListener('click', (e) => {
      e.preventDefault();
      deleteErrorMessage();
      if (e.target.matches('.cancel-button')) {
        let id_to_delete = e.target.dataset.fileId;
        removeImageFromUploadedFiles(id_to_delete)
      } else {
        uploadFile();
      }
    });
  

  function uploadFile() {
    if (!inputElement) {
      inputElement = document.createElement('input');
      inputElement.setAttribute('type', 'file');
      inputElement.setAttribute('accept', imageInputAccept);
      inputElement.setAttribute('multiple', true)
    }
    // Trigger the file selector when the button is clicked
    inputElement.click();

    // Handle file selection
    inputElement.onchange = () => {
      if (!listOfUploadedFiles) {
        listOfUploadedFiles = document.createElement('ul')
        listOfUploadedFiles.classList.add('list-of-uploaded_files')
        dropzone_text_instruction?.after(listOfUploadedFiles);
      }
      const files = inputElement.files;
      for (file of files) {
        startSDKWithFile(file);
      
      }
      if (uploadedFiles.length !== 0) {
        dropzone_text_instruction.style.display = 'none';

      }
    };
  }
  function startSDKWithFile(file) {
    if (!file) return;
    const maxSize = sizeLimits.image ?? 40 * 1024 * 1024;
    if (validImageTypes.includes(file.type) && file.size <= maxSize) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // конвертирует Blob в base64 и вызывает onload
      reader.onload = function() {
        let file_id = ++lastUsedId
        let fileIdTuple = {'id':file_id, 'file':file}
        uploadedFiles.push(fileIdTuple);
        console.log('Uploaded Files:', uploadedFiles);
        makeUploadedFilePreview(data_url=reader.result, id=lastUsedId);
      };
    } else if (!error) {
      let invalidInputError;
      if (!validImageTypes.includes(file.type)) invalidInputError = 'invalid image type. Please make sure your image format is one of the following: "image/png", "image/jpeg", "image/jpg"';
      else if (file.size > maxSize) invalidInputError = 'your image file is too large';

      error = document.createElement('p');
      error.classList.add('error')
      error.innerHTML = invalidInputError
      dropzone_text_instruction?.before(error);
    }
  }
  function makeUploadedFilePreview (data_url, id) {
    const file_miniature = document.createElement('li');
        const file_miniature_div = document.createElement('div');
        const file_miniature_preview = document.createElement('img');
        const file_miniature_cancel_button = document.createElement('img');

        file_miniature_cancel_button.setAttribute('src', '/static/admin/photo_dropzone/svg/cancel_mark.svg');
        file_miniature_cancel_button.classList.add('cancel-button');
        file_miniature_cancel_button.addEventListener('click', removeImageFromUploadedFiles);
        file_miniature_cancel_button.setAttribute('data-file-id', id)

        file_miniature_preview.setAttribute('src', data_url);
        file_miniature_preview.classList.add('preview-image');
        file_miniature_div.classList.add('uploaded-file-miniature');
        
        file_miniature_div.appendChild(file_miniature_preview);
        file_miniature_div.appendChild(file_miniature_cancel_button);
        file_miniature.appendChild(file_miniature_div);

        listOfUploadedFiles.appendChild(file_miniature);
  };
  function deleteErrorMessage() {
    if (error) {
      error.remove()
    };
  }
  function removeImageFromUploadedFiles(id_to_delete) {
    let indexToDelete = uploadedFiles.findIndex(obj => obj.id == id_to_delete);
    if (indexToDelete !== -1) {
      uploadedFiles.splice(indexToDelete, 1);
      removeImagePreviewElement(id_to_delete);
    }
    console.log(uploadedFiles);
  }
  function removeImagePreviewElement(id_to_delete) {
    let elementToRemove = document.querySelector(
      'img.cancel-button[data-file-id="' + id_to_delete + '"]'
    ).closest('li');
    if (elementToRemove) {
      elementToRemove.remove();
    }
  }
});