import { Component, OnInit, ViewChild } from '@angular/core';
import { IpfsService } from '../services/ipfs.service';
import 'rxjs/add/operator/map';
import { ContractService } from '../services/contract.service';
import { HttpClient } from '@angular/common/http'
declare const Materialize;

@Component({
  selector: 'app-manufacture',
  templateUrl: './manufacture.component.html',
  styleUrls: ['./manufacture.component.css']
})
export class ManufactureComponent implements OnInit {

  dataValue = [];
  @ViewChild('product') product: any;
  @ViewChild('orderNo') orderNo: any;
  @ViewChild('deliveryDate') deliveryDate: any;
  @ViewChild('temp') temp: any;
  @ViewChild('price') price: any;
  @ViewChild('quantity') quantity: any;
  @ViewChild('report') report: any;
  @ViewChild('expiry') expiry: any;

  @ViewChild('prod') product1: any;
  @ViewChild('order') orderNo1: any;
  @ViewChild('ddate') deliveryDate1: any;
  @ViewChild('cost') price1: any;
  @ViewChild('quant') quantity1: any;

  name = 'Manufacturer';

  sendProductList = [
    { name: 'Dolo', cost: 50, batch: "P1", expiry: "12/11/2022" },
    { name: 'Crocin', cost: 35, batch: "P2", expiry: "9/10/2021" },
    { name: 'Mondeslor', cost: 80, batch: "P3", expiry: "5/9/2022" },
    { name: 'Allegra', cost: 30, batch: "P4", expiry: "1/8/2020" },
    { name: 'Citrizen', cost: 20, batch: "P5", expiry: "21/3/2023" }
  ];

  requestProductList = [
    { name: 'Flavouring', cost: 50, batch: "P1", expiry: "19/1/2022" },
    { name: 'Ascorbate', cost: 35, batch: "P2", expiry: "22/3/2021" },
    { name: 'Benzocaine', cost: 80, batch: "P3", expiry: "12/7/2022" },
    { name: 'Desloratidine', cost: 30, batch: "P4", expiry: "30/5/2020" },
    { name: 'Edible Plastic', cost: 20, batch: "P5", expiry: "11/11/2023" }
  ];

  selectedProduct = { name: null, cost: 0 };
  selectedQuantity = 0;
  minDate;
  transactions;


  constructor(private ipfs: IpfsService, private contract: ContractService, private http: HttpClient) { }
  ngOnInit() {
    this.getTransactions();
    this.getToday();

    this.orderNo1.nativeElement.value = "EBC"+(this.contract.getCurrentBlockNumber()+1);

    this.contract.checkMfgTrigger.subscribe(result => {
      if (result !== 'noop') {
      this.setData(result);
      }
    });
    this.contract.checkReportTrigger.subscribe(result => {
      if (result.length >= 1) {
      this.setReport(result);
      }
    });
  }

  fileChange(event: any) {
    this.ipfs.fileChange(event.target.files).subscribe(
      data => { this.report.nativeElement.value = data.msg; },
      error => {console.log(error)}
      );
  }

  setData(orderno) {
    let bprod;
    this.contract.fetchInitialDetails(orderno).then(result => {
      Materialize.toast('New Order Received. Order No: ' + orderno, 4000);
      this.orderNo.nativeElement.value = orderno;
      this.orderNo1.nativeElement.value = orderno;
      // this.temp.nativeElement.value = result[2];
      this.price.nativeElement.value = result[2];
      Materialize.updateTextFields();
    });
    this.contract.getDistValues(orderno).then(result => {
      console.log(result);
      this.product.nativeElement.value = result[0];
      this.deliveryDate.nativeElement.value = result[1];
      this.price.nativeElement.value = result[2];
      this.quantity.nativeElement.value = result[3];
      this.temp.nativeElement.value = this.sendProductList.filter(e => {
        if(e.name === this.product.nativeElement.value) bprod = e;
      }) !== [] ? bprod.batch : '';
      this.expiry.nativeElement.value = bprod ? bprod.expiry : '';
      Materialize.updateTextFields();
    });
  }

  setReport(result) {
    if ( result[1] == '3') {
      this.http.get('http://127.0.0.1:8080/ipfs/' + result[2], { responseType: 'text'}).subscribe(response => {
        this.dataValue.push({orderno: result[0], fileInfo: response + result[2]});
      });
    }
  }

  onSubmitReport(event) {
    this.contract.setReport(
      this.orderNo.nativeElement.value, 2,
      this.report.nativeElement.value).then(result => {
      Materialize.toast('Shipment sent. Tx id: ' + result.tx, 4000);
      this.product.nativeElement.value = null;
      this.orderNo.nativeElement.value = null;
      this.deliveryDate.nativeElement.value = null;
      this.temp.nativeElement.value = null;
      this.price.nativeElement.value = null;
      this.quantity.nativeElement.value = null;
      this.report.nativeElement.value = null;
      this.expiry.nativeElement.value = null;
      this.getTransactions();
    });
  }

  onSubmit(event) {
    this.contract.setMfgValues(this.orderNo1.nativeElement.value,
      this.name,
      this.product1.nativeElement.value,
      this.deliveryDate1.nativeElement.value,
      this.price1.nativeElement.value,
      this.quantity1.nativeElement.value).then(result => {
      console.log(result);
      Materialize.toast('Request Created. Tx id: ' + result.tx, 4000);
      this.selectedProduct = { name: null, cost: 0 };
      this.product1.nativeElement.value = null;
      this.selectedQuantity = 0;
      this.quantity1.nativeElement.value = null;
      this.price1.nativeElement.value = null;
      this.getToday();
      this.deliveryDate.nativeElement.value = this.minDate;
      this.expiry.nativeElement.value = null;
      this.orderNo1.nativeElement.value = "EBC"+(this.contract.getCurrentBlockNumber()+1);
      this.getTransactions();
    });
  }

  getToday() {
    let dtToday = new Date();
    let month: any = dtToday.getMonth() + 1;
    let day: any = dtToday.getDate();
    let year: any = dtToday.getFullYear();
    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();
     this.minDate = year + '-' + month + '-' + day;
  }

  setSelectedProduct(product) {
    this.selectedProduct = this.requestProductList.filter(e => e.name === product)[0];
    this.price1.nativeElement.value = this.selectedProduct.cost*this.selectedQuantity;
  }

  setSelectedQuantity(quantity) {
    this.selectedQuantity = quantity;
    this.price1.nativeElement.value = this.selectedProduct.cost*this.selectedQuantity;
  }

  getTransactions() {
    this.transactions = [];
    let blockNumber = this.contract.getCurrentBlockNumber();
    for(let i=1; i<=blockNumber; i++) {
      this.transactions.push(this.contract.getTransaction(i));
    }
  }
}
