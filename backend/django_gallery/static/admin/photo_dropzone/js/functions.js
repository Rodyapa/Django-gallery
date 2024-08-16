export function deleteErrorMessage(error) {
    if (error) {
      error.remove()
      error = false
    };
  }
export function removeImageFromonUploadFiles(id_to_delete) {
    let indexToDelete = ExchangeHubV1.onUploadFiles.findIndex(obj => obj.id == id_to_delete);
    if (indexToDelete !== -1) {
      ExchangeHubV1.onUploadFiles.splice(indexToDelete, 1);
      removeImagePreviewElement(id_to_delete);
    }
  }
export function removeImagePreviewElement(id_to_delete) {
    let elementToRemove = document.querySelector(
      'img.cancel-button[data-file-id="' + id_to_delete + '"]'
    ).closest('li');
    if (elementToRemove) {
      elementToRemove.remove();
    }
  }
export function showResultMarkOnPreview(id, success=true) {
  const file_miniature_div = document.querySelector(`div.uploaded-file-miniature[data-file-id="${id}"]`);
  const exisitngMarks = file_miniature_div.querySelectorAll('img.accepted-mark, img.failed-mark');

  exisitngMarks.forEach(img => img.remove());

  const resultMark = document.createElement('img');

  if (success) {
    resultMark.setAttribute('src', '/static/admin/photo_dropzone/svg/accepted_mark.svg');
    resultMark.classList.add('accepted-mark');
  } else {
    resultMark.setAttribute('src', '/static/admin/photo_dropzone/svg/failed_mark.svg');
    resultMark.classList.add('failed-mark');
  }
  file_miniature_div.appendChild(resultMark);
  
}