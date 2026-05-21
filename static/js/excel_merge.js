document.addEventListener('DOMContentLoaded', function () {

    const mergeBtn = document.getElementById('mergeBtn');

    mergeBtn.addEventListener('click', async function () {

        const file1 = document.getElementById('file1').files[0];
        const file2 = document.getElementById('file2').files[0];

        const keyColumn =
            document.getElementById('keyColumn').value;

        const latestLogic =
            document.getElementById('latestLogic').value;

        const dateColumn =
            document.getElementById('dateColumn').value;

        const statusMessage =
            document.getElementById('statusMessage');

        if (!file1 || !file2) {

            statusMessage.innerText =
                'Please upload both files';

            return;
        }

        if (!keyColumn) {

            statusMessage.innerText =
                'Please enter unique key column';

            return;
        }

        try {

            statusMessage.innerText =
                'Processing Excel merge...';

            const formData = new FormData();

            formData.append('file1', file1);
            formData.append('file2', file2);

            formData.append(
                'key_column',
                keyColumn
            );

            formData.append(
                'latest_logic',
                latestLogic
            );

            formData.append(
                'date_column',
                dateColumn
            );

            const response = await fetch(
                '/excel-merge/process',
                {
                    method: 'POST',
                    body: formData
                }
            );

            const result = await response.json();

            if (result.success) {

                statusMessage.innerText =
                    result.message;

                document.getElementById(
                    'totalRows'
                ).innerText = result.total_rows;

                document.getElementById(
                    'updatedRows'
                ).innerText = result.updated_rows;

                document.getElementById(
                    'newRows'
                ).innerText = result.new_rows;

                document.getElementById(
                    'duplicatesRemoved'
                ).innerText = result.duplicates_removed;

                const downloadBtn =
                    document.getElementById(
                        'downloadBtn'
                    );

                downloadBtn.style.display =
                    'inline-block';

                downloadBtn.onclick = function () {

                    window.location.href =
                        '/excel-merge/download/' +
                        result.download_file;
                };

            } else {

                statusMessage.innerText =
                    result.message;
            }

        } catch (error) {

            console.error(error);

            statusMessage.innerText =
                'Error while processing files';
        }

    });

});