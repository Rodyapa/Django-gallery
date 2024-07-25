window.ExchangeHubV1 = {
  'onUploadFiles':[],
  'alreadyUploadedFilesIds': new Set()
  };

import {
  deleteErrorMessage,
  removeImageFromonUploadFiles,
  removeImagePreviewElement,
} from '/static/admin/photo_dropzone/js/functions.js';

document.addEventListener("DOMContentLoaded", () => {
    let inputElement;
    let listOfonUploadFiles;
    let error;
    let lastUsedId = 0;
    const dropzone_container = document.querySelector('div[class=dropzone-container]');
    const dropzone_text_instruction = document.querySelector('div[class=dropzone-text-instruction]');
    const imageInputAccept = '.png, .jpeg, .jpg';
    const sizeLimits = {
      image: 40 * 1024 * 1024,
    };
    const maxPhotoAmount = 30;
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  dropzone_container.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.matches('.cancel-button')) {
        let id_to_delete = e.target.dataset.fileId;
        removeImageFromonUploadFiles(id_to_delete)
      } else {
        uploadFiles();
      }
      deleteErrorMessage(error);
      ShowHideTextInstruction();
    });
  
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropzone_container.addEventListener(eventName, preventDefaults, false)
  })
  function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  ;['dragenter', 'dragover'].forEach(eventName => {
    dropzone_container.addEventListener(eventName, highlight, false)
  })
  
  ;['dragleave', 'drop'].forEach(eventName => {
    dropzone_container.addEventListener(eventName, unhighlight, false)
  })
  
  function highlight(e) {
    dropzone_container.classList.add('highlighted-dashed-border')
  }
  
  function unhighlight(e) {
    dropzone_container.classList.remove('highlighted-dashed-border')
  }

  dropzone_container.addEventListener('drop', handleDrop, false)

  function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files
  
    handleFiles(files)
  }
  function handleFiles(files) {
    ([...files]).forEach(startSDKWithFile)
  }
  
  

  function uploadFiles() {
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
      if (!listOfonUploadFiles) {
        listOfonUploadFiles = document.createElement('ul')
        listOfonUploadFiles.classList.add('list-of-uploaded_files')
        dropzone_text_instruction?.after(listOfonUploadFiles);
      }
      const files = inputElement.files;
      for (const file of files) {
        if (error) {
          break
        }
        startSDKWithFile(file);
      }
    };
  }
  function startSDKWithFile(file) {
    if (!file) return;
    const maxSize = sizeLimits.image ?? 40 * 1024 * 1024;
    if (validImageTypes.includes(file.type) && file.size <= maxSize && ExchangeHubV1.onUploadFiles.length < maxPhotoAmount) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // конвертирует Blob в base64 и вызывает onload
      reader.onload = function() {
        let file_id = ++lastUsedId
        let fileIdTuple = {'id':file_id, 'file':file}
        ExchangeHubV1.onUploadFiles.push(fileIdTuple);
        console.log('Uploaded Files:', ExchangeHubV1.onUploadFiles);
        makeUploadedFilePreview(reader.result, lastUsedId);
      };
    } else if (!error) {
      let invalidInputError;
      if (!validImageTypes.includes(file.type)){
        invalidInputError = 'invalid image type. Please make sure your image format is one of the following: "image/png", "image/jpeg", "image/jpg"'}
      else if (file.size > maxSize) {
        invalidInputError = 'your image file is too large'}
      else if (ExchangeHubV1.onUploadFiles.length >= maxPhotoAmount) {
        invalidInputError = (`You can not download more than ${maxPhotoAmount} photos at once`)
      };

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
        file_miniature_cancel_button.addEventListener('click', removeImageFromonUploadFiles);
        file_miniature_cancel_button.setAttribute('data-file-id', id);

        file_miniature_preview.setAttribute('src', data_url);
        file_miniature_preview.classList.add('preview-image');
        file_miniature_div.classList.add('uploaded-file-miniature');
        file_miniature_div.setAttribute('data-file-id', id);

        file_miniature_div.appendChild(file_miniature_preview);
        file_miniature_div.appendChild(file_miniature_cancel_button);
        file_miniature.appendChild(file_miniature_div);

        listOfonUploadFiles.appendChild(file_miniature);
  };
  function ShowHideTextInstruction () {
    if (ExchangeHubV1.onUploadFiles.length > 0) {
      dropzone_text_instruction.style.display = 'none'; 
    }
    else {
      dropzone_text_instruction.style.display = 'block'; 
    }
  };
});