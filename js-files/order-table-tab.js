import { openModal } from './components/modals/modals.js';
import { initInputDebounce } from './services/input-debounce/input-debounce.js';
import { getTransferServerData } from './services/config-control/config-control.js';
import { showProgressBar, hideProgressBar } from './components/progress-bar/progress-bar.js';

import { MODAL_TYPES } from './components/modals/_data/modal-types.js';
import { tcamSettingsData } from './tcam-settings-data.js';

const DELIVERY_METHODS = {
    'nova-poshta': 'Нова пошта',
    'express-delivery': 'Експрес доставка'
}

const getEmailHtml = (data, deliveryNumber) => (`
<!DOCTYPE html>
<html lang=en>
<head>
  <meta charset=UTF-8>
  <title>UV-PCB-tech</title>
  <style type="text/css">
      body {
          margin: 0;
          padding: 0;
          min-width: 100% !important;
          font-family: verdana, geneva, sans-serif;
      }
      
      p {
        margin: 14px 0;
      }

      .content {
          width: 100%;
          max-width: 600px;
      }

      .w-100 {
          width: 100%;
      }

      .left-padding {
          padding-left: 60px;
      }

      .right-padding {
          padding-right: 60px;
      }

      .center-align {
          text-align: center;
      }

      .show-border td {
          border-bottom: thin solid #16192b;
      }

      .cell-name {
          width: 30%;
          font-size: 16px;
          line-height: 30px;
          padding: 15px;
      }
      
      .cell-name_vertical-align_top {
          vertical-align: top;
      }
      
      .cell-name p {
          font-size: inherit;
          line-height: inherit;
      }

      .cell-content {
          font-size: 14px;
          padding: 15px;
          line-height: 30px;
          text-align: left;
          font-weight: 700
      }
      
      .cell-content_font-weight-normal {
        font-weight: normal;
      }
  </style>
</head>
<body>
<table class="w-100" style="background: #ffffff;color: black" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center">
      <table class="content" border="0" cellpadding="0" cellspacing="0"
             style="margin:0;padding-bottom:30px;background-color: #f8f8f8">
        <tr>
          <td colspan="3" valign="middle" style="background: #061136">
            <table class="logo-background" style="width: 100%;">
              <tr>
                <td class="left-padding" valign="middle" colspan="2"
                    style="font-family: verdana,geneva,sans-serif;height: 80px;font-size:24px;font-weight:700;color:white">
                  Замовлення №${deliveryNumber}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="left-padding right-padding"
              style="font-size: 20px;font-weight:700;padding-top: 30px;padding-bottom:20px">
            Інформація по оплаті
          </td>
        </tr>
        <tr>
          <td class="left-padding right-padding center-align" colspan="3">
            <table class="w-100" cellpadding="0" cellspacing="0" style="text-align: left;">
              <tr class="show-border">
                <td colspan="3" class="cell-name">
                  Шановний ${data.user.surname} ${data.user.name}, ваше замовлення оброблено і в разі оплати за заначиними 
                  реквізитами буде прийнято в роботу.
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="1" class="cell-name cell-name_vertical-align_top">
                  <p>Реквізити:</p>
                </td>
                <td colspan="2" class="cell-content cell-content_font-weight-normal">
                  <p><b>Установа банку:</b><br> ПриватБанк</p>
                  <p><b>МФО банку:</b><br> 305299</p>
                  <p><b>Код РНОКПП отримувача:</b><br> 3701101251</p>
                  <p><b>Рахунок отримувача:</b><br> 26207748836815</p>
                  <p><b>IBAN:</b><br> UA293052990000026207748836815</p>
                  <p><b>Сума:</b><br> ${data.totalCost} грн</p>
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="3" class="cell-name">
                  Рахунок-фактура дійсна 3 доби.
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="3" class="cell-name">
                  Всі питання та узгодження здійснюйте через менеджера Коваленка О.М, пошта: <b>pcbservicetransmit@gmail.com</b>.
                </td>
              </tr>
              <tr>
                <td colspan="3" class="cell-name">
                  Дякуємо, що користувались нашим PCB-сервісом
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="left-padding right-padding"
              style="font-size: 20px;font-weight:700;padding-top: 30px;padding-bottom:20px">
            Інформація про замовлення
          </td>
        </tr>
        <tr>
          <td class="left-padding right-padding center-align" colspan="3">
            <table class="w-100" cellpadding="0" cellspacing="0" style="text-align: left;">
              <tr class="show-border">
                <td colspan="1" class="cell-name">
                  Ім'я:
                </td>
                <td colspan="2" class="cell-content">
                  ${data.user.name}
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="1" class="cell-name">
                  Фамілія:
                </td>
                <td colspan="2" class="cell-content">
                  ${data.user.surname}
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="1" class="cell-name">
                  По батькові:
                </td>
                <td colspan="2" class="cell-content">
                  ${data.user.middleName}
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="1" class="cell-name">
                  Телефон:
                </td>
                <td colspan="2" class="cell-content">
                  ${data.user.phone}
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="1" class="cell-name">
                  E-mail:
                </td>
                <td colspan="2" class="cell-content">
                  ${data.user.email}
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="1" class="cell-name">
                  Спосіб доставки:
                </td>
                <td colspan="2" class="cell-content">
                  ${DELIVERY_METHODS[data.delivery]}
                </td>
              </tr>
              <tr class="show-border">
                <td colspan="1" class="cell-name">
                  Відділення:
                </td>
                <td colspan="2" class="cell-content">
                  ${data.department}
                </td>
              </tr>
              <tr>
                <td colspan="1" class="cell-name">
                  Зашальна сума:
                </td>
                <td colspan="2" class="cell-content">
                  ${data.totalCost} грн
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`)

const sendEmail = data => {
    const transferServerData = getTransferServerData();
    let deliveryNumber = localStorage.getItem('deliveryNumber');
    deliveryNumber = deliveryNumber ? +deliveryNumber : 1;

    fetch(transferServerData.url, {
        method: 'POST',
        mode: 'cors',
        headers: transferServerData.headers,
        body: JSON.stringify({
            subject: `Замовлення №${deliveryNumber}`,
            htmlContent: getEmailHtml(data, deliveryNumber),
            sender: {
                email: 'pcbservicetransmit@gmail.com',
                name: 'PcbTransmitService'
            },
            to: [
                {
                    email: data.user.email,
                    name: `${data.user.name} ${data.user.surname}`
                },
                {
                    email: 'pcbservicetransmit@gmail.com',
                }
            ],
        })
    })
        .then(response => {
            hideProgressBar();
            if (response.ok) {
                openModal(MODAL_TYPES.SUCCESSFUL_ORDER_MODAL, {
                    heading: 'Замовлення оформленно',
                    text: `Операці замовлення була успішно виконана`
                }).then();
                localStorage.setItem('deliveryNumber', deliveryNumber + 1);
                ORDER_FORM.reset();
                orderData = deepClone(DEFAULT_ORDER_DATA);
            } else {
                openModal(MODAL_TYPES.ERROR_MESSAGE, {
                    heading: 'Помилка офрмлення',
                    text: `Виникла помилка при оформленні замовлення, спробуйте пізніше`
                }).then();
            }
            return response.json()
        })
        .catch(() => {
            hideProgressBar();
            openModal(MODAL_TYPES.ERROR_MESSAGE, {
                heading: 'Помилка офрмлення',
                text: `Виникла помилка при оформленні замовлення, спробуйте пізніше`
            }).then();
        });
}

const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}

const DEFAULT_ORDER_DATA = {
    totalCost: 0,
    user: {
        name: '',
        surname: '',
        middleName: '',
        phone: '',
        email: ''
    },
    delivery: 'nova-poshta',
    department: '',
    quantity: 1,
    material: '',
    technicalScheme: ''
}

let orderData = deepClone(DEFAULT_ORDER_DATA);

const initOrderData = () => {
    const {
        totalCost,
        material
    } = tcamSettingsData.manufacturingParams;

    const {
        leftZone,
        rightZone
    } = tcamSettingsData.technologicalScheme;

    orderData.totalCost = totalCost * orderData.quantity;
    orderData.material = material.type;
    orderData.technicalScheme = leftZone + '-' + rightZone;

    ORDER_MATERIAL_SPAN.textContent = orderData.material;
    ORDER_COST_SPAN.textContent = orderData.totalCost;
    ORDER_TECHNICAL_SCHEME_SPAN.textContent = orderData.technicalScheme;
};

const parseSendData = (formData) => {
    orderData.user.name = formData.name;
    orderData.user.surname = formData.surname;
    orderData.user.middleName = formData.middleName;
    orderData.user.phone = formData.phone;
    orderData.user.email = formData.email;

    orderData.delivery = formData.delivery;
    orderData.department = formData.department;
    orderData.quantity = formData.quantity;
}

const ORDER_MATERIAL_SPAN = document.getElementById('order-material');
const ORDER_COST_SPAN = document.getElementById('order-cost');
const ORDER_TECHNICAL_SCHEME_SPAN = document.getElementById('order-technical-scheme');

const ORDER_FORM = document.getElementById('order-form');
const ORDER_BUTTON = document.getElementById('order-button');
const ORDER_QUANTITY = document.getElementById('order-quantity');

initInputDebounce(ORDER_QUANTITY, event => {
    orderData.quantity = +event.target.value;
    orderData.totalCost = tcamSettingsData.manufacturingParams.totalCost * orderData.quantity;
    ORDER_COST_SPAN.textContent = orderData.totalCost;
});

ORDER_BUTTON.addEventListener('click', event => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(ORDER_FORM));
    if (ORDER_FORM.checkValidity()) {
        showProgressBar();
        parseSendData(formData);
        sendEmail(orderData);
    } else {
        openModal(MODAL_TYPES.ERROR_MESSAGE, {
            heading: 'Невалідні дані',
            text: `Дані форми є неваліднимим, або деякі поля є не заповненими`
        }).then();
    }
});

export {
    initOrderData
}
