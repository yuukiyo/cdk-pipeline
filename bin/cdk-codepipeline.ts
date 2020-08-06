#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkCodepipelineStack } from '../lib/cdk-codepipeline-stack';

const app = new cdk.App();
new CdkCodepipelineStack(app, 'CdkCodepipelineStack');
