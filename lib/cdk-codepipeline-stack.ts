import * as cdk from '@aws-cdk/core';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { IRepository } from '@aws-cdk/aws-codecommit';

export class CdkCodepipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //----------
    // CodeCommit
    //----------
    const repo = new codecommit.Repository(this, 'Repo', {
      repositoryName: 'amplify headless build',
      description: 'amplify headless build',
    });

    const sourceOutput = new codepipeline.Artifact('codecommit-artifact-name')

    //----------
    // CodeBuild
    //----------
    const buildSpec = codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        install: {
          commands: [
            'npm install -g @aws-amplify/cli'
          ]
        },
        build: {
          commands: [
            'ls -al',
            'aws configure set region ap-northeast-1 --profile default',
            'aws configure list',
            'aws sts get-caller-identity',
            './amplifyInit.sh'
          ]
        }
      }
    })

    const project = new codebuild.PipelineProject(this, 'project', {
      projectName: 'codebuild-project',
      buildSpec: buildSpec,
      environment: {
        environmentVariables: {
          hoge: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: 'prod',
          }
        },
      }
    });
    project.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        'lambda:UpdateFunctionCode',
        'lambda:UpdateFunctionConfiguration'
      ]
    }
    ));

    //----------
    // CodePipeline
    //----------
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'hoge',
      repository: repo,
      output: sourceOutput,
    })
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project: project,
      input: sourceOutput,
      outputs: [new codepipeline.Artifact()]
    });
    const pipeline = new codepipeline.Pipeline(this, 'MyFirstPipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction]
        },
        {
          stageName: 'Build',
          actions: [buildAction]
        }
      ]
    });
  }
}
