import { Button, Result } from 'antd';
import { useRouter } from 'next/router';

const Page404 = () => {

  const { push } = useRouter();

  const handleBackHome = () => {
    push('/');
  }
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={<Button type="primary" onClick={handleBackHome}>Back Home</Button>}
    />
)
};

export default Page404;