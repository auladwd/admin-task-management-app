import Swal from 'sweetalert2';

/**
 * Show a SweetAlert2 delete confirmation dialog.
 * Returns true if the user clicked Confirm, false otherwise.
 *
 * @param {object} options
 * @param {string} options.title      - Dialog title
 * @param {string} options.text       - Dialog body text
 * @param {string} [options.confirmText] - Confirm button label (default: "Yes, Delete")
 */
export async function confirmDelete({
  title,
  text,
  confirmText = 'Yes, Delete',
}) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444', // red-500
    cancelButtonColor: '#6b7280', // gray-500
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-lg font-bold',
      confirmButton: 'rounded-lg px-5 py-2 text-sm font-semibold',
      cancelButton: 'rounded-lg px-5 py-2 text-sm font-semibold',
    },
  });

  return result.isConfirmed;
}
