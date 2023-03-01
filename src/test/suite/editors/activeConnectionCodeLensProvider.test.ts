import * as vscode from 'vscode';
import { beforeEach, afterEach } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import type { DataService } from 'mongodb-data-service';

import ActiveConnectionCodeLensProvider from '../../../editors/activeConnectionCodeLensProvider';
import ConnectionController from '../../../connectionController';
import { StatusView } from '../../../views';
import { StorageController } from '../../../storage';
import { TestExtensionContext } from '../stubs';
import TelemetryService from '../../../telemetry/telemetryService';

const expect = chai.expect;

suite('Active Connection CodeLens Provider Test Suite', () => {
  const mockExtensionContext = new TestExtensionContext();
  const mockStorageController = new StorageController(mockExtensionContext);
  const testTelemetryService = new TelemetryService(
    mockStorageController,
    mockExtensionContext
  );
  const testStatusView = new StatusView(mockExtensionContext);

  suite('the MongoDB playground in JS', () => {
    suite('user is not connected', () => {
      const testConnectionController = new ConnectionController(
        testStatusView,
        mockStorageController,
        testTelemetryService
      );
      const testCodeLensProvider = new ActiveConnectionCodeLensProvider(
        testConnectionController
      );
      const mockShowQuickPick = sinon.fake();

      beforeEach(() => {
        testCodeLensProvider.setActiveTextEditor(
          vscode.window.activeTextEditor
        );
        sinon.replace(vscode.window, 'showQuickPick', mockShowQuickPick);
        const mockIsPlayground = sinon.fake.returns(true);
        sinon.replace(testCodeLensProvider, 'isPlayground', mockIsPlayground);
      });

      afterEach(() => {
        sinon.restore();
      });

      test('show disconnected message in code lenses', () => {
        const codeLens = testCodeLensProvider.provideCodeLenses();

        expect(codeLens).to.be.an('array');
        expect(codeLens.length).to.be.equal(1);
        expect(codeLens[0].command?.title).to.be.equal(
          'Disconnected. Click here to connect.'
        );
        expect(codeLens[0].range.start.line).to.be.equal(0);
        expect(codeLens[0].range.end.line).to.be.equal(0);
      });
    });

    suite('user is connected', () => {
      const testConnectionController = new ConnectionController(
        testStatusView,
        mockStorageController,
        testTelemetryService
      );
      const testCodeLensProvider = new ActiveConnectionCodeLensProvider(
        testConnectionController
      );
      const findStub = sinon.stub();
      findStub.resolves([
        {
          field: 'Text message',
        },
      ]);
      const instanceStub = sinon.stub();
      instanceStub.resolves({
        dataLake: {},
        build: {},
        genuineMongoDB: {},
        host: {},
      } as unknown as Awaited<ReturnType<DataService['instance']>>);
      const mockActiveDataService = {
        find: findStub,
        instance: instanceStub,
      } as Pick<DataService, 'find' | 'instance'> as unknown as DataService;

      testConnectionController.setActiveDataService(mockActiveDataService);

      beforeEach(() => {
        testCodeLensProvider.setActiveTextEditor(
          vscode.window.activeTextEditor
        );
        sinon.replace(
          testConnectionController,
          'getActiveConnectionName',
          sinon.fake.returns('fakeName')
        );
        const mockIsPlayground = sinon.fake.returns(true);
        sinon.replace(testCodeLensProvider, 'isPlayground', mockIsPlayground);
      });

      afterEach(() => {
        sinon.restore();
      });

      test('show active connection in code lenses', () => {
        const codeLens = testCodeLensProvider.provideCodeLenses();

        expect(codeLens).to.be.an('array');
        expect(codeLens.length).to.be.equal(1);
        expect(codeLens[0].command?.title).to.be.equal(
          'Currently connected to fakeName. Click here to change connection.'
        );
        expect(codeLens[0].range.start.line).to.be.equal(0);
        expect(codeLens[0].range.end.line).to.be.equal(0);
        expect(codeLens[0].command?.command).to.be.equal(
          'mdb.changeActiveConnection'
        );
      });
    });
  });

  suite('the regular JS file', () => {
    suite('user is not connected', () => {
      const testConnectionController = new ConnectionController(
        testStatusView,
        mockStorageController,
        testTelemetryService
      );
      const testCodeLensProvider = new ActiveConnectionCodeLensProvider(
        testConnectionController
      );
      const mockShowQuickPick = sinon.fake();

      beforeEach(() => {
        sinon.replace(vscode.window, 'showQuickPick', mockShowQuickPick);
        const mockIsPlayground = sinon.fake.returns(false);
        sinon.replace(testCodeLensProvider, 'isPlayground', mockIsPlayground);
      });

      afterEach(() => {
        sinon.restore();
      });

      test('show not show the active connection code lenses', () => {
        const codeLens = testCodeLensProvider.provideCodeLenses();

        expect(codeLens).to.be.an('array');
        expect(codeLens.length).to.be.equal(0);
      });
    });

    suite('user is connected', () => {
      const testConnectionController = new ConnectionController(
        testStatusView,
        mockStorageController,
        testTelemetryService
      );
      const testCodeLensProvider = new ActiveConnectionCodeLensProvider(
        testConnectionController
      );

      const findStub = sinon.stub();
      findStub.resolves([
        {
          field: 'Text message',
        },
      ]);
      const instanceStub = sinon.stub();
      instanceStub.resolves({
        dataLake: {},
        build: {},
        genuineMongoDB: {},
        host: {},
      } as unknown as Awaited<ReturnType<DataService['instance']>>);
      const mockActiveDataService = {
        find: findStub,
        instance: instanceStub,
      } as Pick<DataService, 'find' | 'instance'> as unknown as DataService;
      testConnectionController.setActiveDataService(mockActiveDataService);

      beforeEach(() => {
        sinon.replace(
          testConnectionController,
          'getActiveConnectionName',
          sinon.fake.returns('fakeName')
        );
        const mockIsPlayground = sinon.fake.returns(false);
        sinon.replace(testCodeLensProvider, 'isPlayground', mockIsPlayground);
      });

      afterEach(() => {
        sinon.restore();
      });

      test('show not show the active connection code lensess', () => {
        const codeLens = testCodeLensProvider.provideCodeLenses();

        expect(codeLens).to.be.an('array');
        expect(codeLens.length).to.be.equal(0);
      });
    });
  });
});