import { Component, OnInit, ViewChild } from '@angular/core';
import { IpfsService } from '../services/ipfs.service';
import 'rxjs/add/operator/map';
import { ContractService } from '../services/contract.service';
declare const Materialize;

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent implements OnInit {

  name = 'Supplier'

  productList = [
    { name: 'Flavouring', cost: 50, batch: "P1", expiry: "19/1/2022" },
    { name: 'Ascorbate', cost: 35, batch: "P2", expiry: "22/3/2021" },
    { name: 'Benzocaine', cost: 80, batch: "P3", expiry: "12/7/2022" },
    { name: 'Desloratidine', cost: 30, batch: "P4", expiry: "30/5/2020" },
    { name: 'Edible Plastic', cost: 20, batch: "P5", expiry: "11/11/2023" }
  ];

  @ViewChild('product') product: any;
  @ViewChild('orderNo') orderNo: any;
  @ViewChild('deliveryDate') deliveryDate: any;
  @ViewChild('price') price: any;
  @ViewChild('quantity') quantity: any;
  @ViewChild('report') report: any;
  @ViewChild('expiry') expiry: any;
  @ViewChild('batch') batch: any;

  constructor(private ipfs: IpfsService, private contract: ContractService) { }
  ngOnInit() {
    this.contract.checkSupplierTrigger.subscribe(result => {
      if (result !== 'noop') {
      this.setData(result);
      }
    });
  }

  setData(orderno) {
    let bprod;
    console.log(orderno);
    this.contract.getMfgDetails(orderno).then(result => {
      console.log(result);
      this.product.nativeElement.value = result[4];
      this.orderNo.nativeElement.value = orderno;
      this.deliveryDate.nativeElement.value = result[1];
      this.price.nativeElement.value = result[2];
      this.quantity.nativeElement.value = result[3];
      this.batch.nativeElement.value = this.productList.filter(e => {
        if(e.name === this.product.nativeElement.value) bprod = e;
      }) !== [] ? bprod.batch : '';
      this.expiry.nativeElement.value = bprod ? bprod.expiry : '';
      Materialize.updateTextFields();
    })};

  fileChange(event: any) {
    this.ipfs.fileChange(event.target.files).subscribe(
      data => { this.report.nativeElement.value = data.msg; },
      error => {console.log(error)}
      );
  }

  onSubmitReport(event) {
    this.contract.setReport(
      this.orderNo.nativeElement.value, 3,
      this.report.nativeElement.value).then(result => {
        this.product.nativeElement.value = null;
        this.orderNo.nativeElement.value = null;
        this.deliveryDate.nativeElement.value = null;
        this.price.nativeElement.value = null;
        this.quantity.nativeElement.value = null;
        this.expiry.nativeElement.value = null;
        this.batch.nativeElement.value = null
        Materialize.toast('Shipment sent. Tx id: ' + result.tx, 4000);
      });
  }

}
