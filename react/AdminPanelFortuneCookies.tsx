
import * as React from 'react';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { PageHeader, Layout, PageBlock } from 'vtex.styleguide';
import AdminPanel from './components/adminPanel/index';

const AdminPanelFortuneCookies: FC = () => {
  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin/fortune-cookies.title" />}
        />
      }
    >
      <PageBlock variation="full">
        <AdminPanel />
      </PageBlock>
    </Layout>
  )
}

export default AdminPanelFortuneCookies
